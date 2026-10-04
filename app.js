
const money=n=>new Intl.NumberFormat('fr-BE',{style:'currency',currency:'EUR'}).format(Number(n||0));
const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
const STORAGE='restaurantProGithubDemoV211';
let pendingProductConfig=null;

const defaults={
  user:null,cashOpen:false,cashOpening:0,currentMode:'table',tableId:null,category:'Plats',sent:false,dirty:false,payment:'card',
  rooms:[{id:1,name:'Salle principale'}],nextRoomId:2,nextTableId:11,posRoomId:1,settingsRoomId:1,
  tables:[
    {id:1,number:1,name:'Table 1',seats:2,roomId:1,x:8,y:10},{id:2,number:2,name:'Table 2',seats:4,roomId:1,x:30,y:10},{id:3,number:3,name:'Table 3',seats:2,roomId:1,x:52,y:10},{id:4,number:4,name:'Table 4',seats:4,roomId:1,x:74,y:10},
    {id:5,number:5,name:'Table 5',seats:2,roomId:1,x:8,y:38},{id:6,number:6,name:'Table 6',seats:4,roomId:1,x:30,y:38},{id:7,number:7,name:'Table 7',seats:4,roomId:1,x:52,y:38},{id:8,number:8,name:'Table 8',seats:2,roomId:1,x:74,y:38},
    {id:9,number:9,name:'Table 9',seats:2,roomId:1,x:18,y:68},{id:10,number:10,name:'Table 10',seats:6,roomId:1,x:58,y:68}
  ],
  products:[
    {id:1,cat:'Entrées',name:'Croquettes parmesan',price:12.9,vat:12,station:'Cuisine',stock:30,low:5},
    {id:2,cat:'Entrées',name:'Croquettes crevettes',price:15.9,vat:12,station:'Cuisine',stock:24,low:5},
    {id:3,cat:'Entrées',name:'Scampis à l’ail',price:14.5,vat:12,station:'Cuisine',stock:20,low:4},
    {id:4,cat:'Plats',name:'Boulets liégeois',price:19.9,vat:12,station:'Cuisine',stock:40,low:8},
    {id:5,cat:'Plats',name:'Carbonnade',price:25.9,vat:12,station:'Cuisine',stock:25,low:5},
    {id:6,cat:'Plats',name:'Vol-au-vent',price:22.9,vat:12,station:'Cuisine',stock:18,low:4},
    {id:7,cat:'Plats',name:'Entrecôte',price:29.9,vat:12,station:'Cuisine',stock:16,low:4,askCooking:true,askSauce:true},
    {id:8,cat:'Desserts',name:'Café liégeois',price:8.5,vat:12,station:'Dessert',stock:30,low:5},
    {id:9,cat:'Desserts',name:'Crème brûlée',price:8.5,vat:12,station:'Dessert',stock:22,low:4},
    {id:10,cat:'Boissons',name:'Coca-Cola',price:3.5,vat:21,station:'Bar',stock:60,low:10},
    {id:11,cat:'Boissons',name:'Jupiler',price:3.6,vat:21,station:'Bar',stock:70,low:12},
    {id:12,cat:'Boissons',name:'Verre de vin',price:5,vat:21,station:'Bar',stock:50,low:8}
  ],
  cart:[],openOrders:{},payments:[],reservations:[],nextReservationId:1,nextProductId:13,
  expenses:[],suppliers:[],invoices:[],nextExpenseId:1,nextSupplierId:1,nextInvoiceId:1,
  accompanimentGroups:[{id:1,name:'Accompagnements classiques',items:['Frites','Croquettes','Purée','Pommes vapeur','Salade','Légumes','Riz']}],
  kitchenMessages:['Sans salade','Sans frites','Sans sauce','Sauce à part','Bien chaud','Allergie'],
  nextAccompanimentGroupId:2,
  reservationDate:null,reservationSearch:'',reservationStatusFilter:'all',
  settings:{
    establishmentName:'Restaurant Pro',
    reservationsEnabled:true,maxReservationsPerDay:60,maxCoversPerDay:120,maxPartySize:20,minLeadMinutes:120,
    maxAdvanceDays:90,slotIntervalMinutes:30,defaultDurationMinutes:120,lunchEnabled:true,lunchStart:'12:00',lunchEnd:'14:30',
    dinnerEnabled:true,dinnerStart:'18:00',dinnerEnd:'22:00',enforceServiceHours:true,phoneRequired:true,
    allowUnassignedTable:true,staffCanOverrideLimits:true
  }
};
let state=structuredClone(defaults);

function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function productNeedsCooking(p){
  return /entrec[oô]te|steak|filet de boeuf|filet de bœuf|burger/i.test(String(p?.name||''));
}
function productNeedsSauce(p){
  return /entrec[oô]te|steak|filet de boeuf|filet de bœuf|burger/i.test(String(p?.name||''));
}
function load(){
  try{
    const d=JSON.parse(localStorage.getItem(STORAGE)||'null');
    if(d)state={...structuredClone(defaults),...d,settings:{...defaults.settings,...(d.settings||{})}};
    state.products=(state.products||[]).map(p=>({
      ...p,
      askCooking:p.askCooking!==undefined?Boolean(p.askCooking):productNeedsCooking(p),
      askSauce:p.askSauce!==undefined?Boolean(p.askSauce):productNeedsSauce(p),
      accompanimentGroupId:p.accompanimentGroupId!==undefined?p.accompanimentGroupId:(p.cat==='Plats'?1:null),
      allowKitchenMessage:p.allowKitchenMessage!==undefined?Boolean(p.allowKitchenMessage):true
    }));
    state.accompanimentGroups=Array.isArray(state.accompanimentGroups)&&state.accompanimentGroups.length?state.accompanimentGroups:structuredClone(defaults.accompanimentGroups);
    state.kitchenMessages=Array.isArray(state.kitchenMessages)&&state.kitchenMessages.length?state.kitchenMessages:[...defaults.kitchenMessages];
    state.nextAccompanimentGroupId=Number(state.nextAccompanimentGroupId||2);

    // v2.22 — migration plan de salle / multi-salles + dimensions / rotation
    state.rooms=Array.isArray(state.rooms)&&state.rooms.length?state.rooms:structuredClone(defaults.rooms);
    const firstRoomId=Number(state.rooms[0]?.id||1);
    state.tables=(Array.isArray(state.tables)?state.tables:[]).map((t,index)=>{
      const guessedNumber=Number(t.number||String(t.name||'').match(/\d+/)?.[0]||t.id||index+1);
      const col=index%4,row=Math.floor(index/4);
      return {
        ...t,
        id:Number(t.id||index+1),
        number:guessedNumber,
        name:t.name||`Table ${guessedNumber}`,
        seats:Number(t.seats||2),
        roomId:Number(t.roomId||firstRoomId),
        x:Number.isFinite(Number(t.x))?Number(t.x):8+(col*22),
        y:Number.isFinite(Number(t.y))?Number(t.y):10+(row*28),
        width:Math.max(56,Math.min(220,Number(t.width||100))),
        height:Math.max(42,Math.min(160,Number(t.height||72))),
        rotation:[0,90,180,270].includes(Number(t.rotation))?Number(t.rotation):0,
        shape:['rectangle','rounded','round'].includes(t.shape)?t.shape:'rounded'
      };
    });
    state.nextRoomId=Math.max(Number(state.nextRoomId||0)-1,...state.rooms.map(r=>Number(r.id)||0),0)+1;
    state.nextTableId=Math.max(Number(state.nextTableId||0)-1,...state.tables.map(t=>Number(t.id)||0),0)+1;
    if(!state.rooms.some(r=>Number(r.id)===Number(state.posRoomId)))state.posRoomId=firstRoomId;
    if(!state.rooms.some(r=>Number(r.id)===Number(state.settingsRoomId)))state.settingsRoomId=firstRoomId;
  }catch{}
}
function toast(msg){const t=qs('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function modal(title,html){qs('#modalTitle').textContent=title;qs('#modalBody').innerHTML=html;qs('#modal').classList.remove('hidden')}
function closeModal(){qs('#modal').classList.add('hidden')}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function localDateISO(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function shiftDate(date,days){const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+days);return localDateISO(d)}
function timeToMinutes(v){const [h,m]=String(v||'00:00').split(':').map(Number);return (h||0)*60+(m||0)}
function isManager(){return ['admin','manager'].includes(state.user?.role)}

function applyRole(){
  qsa('.manager-only').forEach(el=>el.classList.toggle('hidden',!isManager()));
}
function showApp(){
  qs('#loginScreen').classList.add('hidden');qs('#app').classList.remove('hidden');
  qs('#userBadge').textContent=`${state.user.name} · ${state.user.role}`;
  applyRole();renderAll();
}
function login(){
  const u=qs('#loginUser').value.trim().toLowerCase(),p=qs('#loginPin').value;
  const users={admin:{pin:'3333',role:'admin',name:'Admin'},manager:{pin:'2222',role:'manager',name:'Responsable'},serveur:{pin:'1111',role:'server',name:'Serveur'}};
  if(!users[u]||users[u].pin!==p)return toast('Identifiants incorrects');
  state.user={username:u,role:users[u].role,name:users[u].name};save();showApp()
}
qs('#loginBtn').onclick=login;qs('#loginPin').onkeydown=e=>{if(e.key==='Enter')login()};
qs('#logoutBtn').onclick=()=>{state.user=null;save();location.reload()};

function setPage(name){
  qsa('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
  qsa('.page').forEach(p=>p.classList.add('hidden'));
  qs(`#page-${name}`).classList.remove('hidden');
  const floating=qs('#floatingReservationsBtn');
  if(floating)floating.classList.toggle('hidden',name==='reservations');
  if(name==='reservations')renderReservations();
  if(name==='products')renderProductsAdmin();
  if(name==='kitchen-options')renderKitchenOptions();
  if(name==='stock')renderStock();
  if(name==='reports')renderReports();
  if(name==='accounting')renderAccounting();
  if(name==='invoices')renderInvoices();
  if(name==='settings')renderSettings();
  window.scrollTo({top:0,behavior:'smooth'});
}
qsa('.navbtn').forEach(b=>b.onclick=()=>setPage(b.dataset.page));
qs('#quickReservationsBtn').onclick=()=>setPage('reservations');
qs('#floatingReservationsBtn').onclick=()=>setPage('reservations');


function renderCash(){
  const b=qs('#cashBadge');b.textContent=state.cashOpen?'Caisse ouverte':'Caisse fermée';b.className='badge '+(state.cashOpen?'open':'closed');
  qs('#openCashBtn').classList.toggle('hidden',state.cashOpen||!isManager());
  qs('#closeCashBtn').classList.toggle('hidden',!state.cashOpen||!isManager());
  renderCart();
}
qs('#openCashBtn').onclick=()=>modal('Ouvrir la caisse',`<div class="form-grid"><label class="span3">Fond de caisse<input id="cashOpenAmount" type="number" step="0.01" value="100"></label><button id="confirmOpenCash" class="primary span3">Ouvrir</button></div>`);
qs('#closeCashBtn').onclick=()=>modal('Fermer la caisse',`<div class="form-grid"><label class="span3">Montant compté<input id="cashCloseAmount" type="number" step="0.01"></label><button id="confirmCloseCash" class="primary span3">Fermer</button></div>`);

function tableReservationToday(tableId){
  const today=localDateISO();
  return state.reservations.filter(r=>r.date===today&&Number(r.tableId)===Number(tableId)&&r.status==='booked').sort((a,b)=>a.time.localeCompare(b.time))[0];
}
function roomById(id){return state.rooms.find(r=>Number(r.id)===Number(id))||state.rooms[0]||null}
function tableByNumber(number){return state.tables.find(t=>Number(t.number)===Number(number))||null}
function tableRoomName(t){return roomById(t?.roomId)?.name||'Salle'}
function tableStatusClass(t){const order=state.openOrders[t.id],res=tableReservationToday(t.id);return (order?' occupied':'')+(res?' reserved':'')+(Number(state.tableId)===Number(t.id)?' active':'')}
function tableButtonInner(t){
  const order=state.openOrders[t.id],res=tableReservationToday(t.id);
  return `<b>${esc(t.name||`Table ${t.number}`)}</b><br><small>N° ${esc(t.number)} · ${t.seats} places${order?' · OUVERTE':''}</small>${res?`<span class="reservation-label">R ${esc(res.time)} · ${esc(res.customerName)}</span>`:''}`;
}
function renderTables(){
  // Compatibilité : si un ancien emplacement #tables existe encore, on l'alimente.
  const w=qs('#tables');if(!w)return;
  w.innerHTML='';
  state.tables.forEach(t=>{
    const b=document.createElement('button');
    b.className='table-btn'+tableStatusClass(t);
    b.innerHTML=tableButtonInner(t);
    b.onclick=()=>selectTable(t);w.appendChild(b)
  })
}
function selectTable(t){
  if(!t)return toast('Table introuvable');
  state.currentMode='table';state.tableId=t.id;state.posRoomId=t.roomId;
  const open=state.openOrders[t.id];
  state.cart=open?consolidateCart(structuredClone(open.items)):[];
  state.sent=!!open;state.dirty=false;
  qsa('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode==='table'));
  const quick=qs('#quickTableNumber');if(quick)quick.value=String(t.number);
  save();renderTables();renderContext();renderCart()
}
function openTableByNumber(){
  const input=qs('#quickTableNumber');
  const number=Number(input?.value||0);
  if(!number)return toast('Indiquez le numéro de table');
  const t=tableByNumber(number);
  if(!t)return toast(`Table ${number} introuvable`);
  selectTable(t);
}
function roomTabsHtml(selectedRoomId,settingsMode=false){
  return `<div class="room-tabs">${state.rooms.map(r=>`<button type="button" class="room-tab ${Number(r.id)===Number(selectedRoomId)?'active':''}" data-${settingsMode?'settings-':'plan-'}room-id="${r.id}">${esc(r.name)}</button>`).join('')}</div>`;
}
function floorPlanTableHtml(t,settingsMode=false){
  const cls=settingsMode?'settings-table-node':'plan-table-node';
  const rotation=[0,90,180,270].includes(Number(t.rotation))?Number(t.rotation):0;
  const baseW=Math.max(56,Math.min(220,Number(t.width||100)));
  const baseH=Math.max(42,Math.min(160,Number(t.height||72)));
  const vertical=rotation===90||rotation===270;
  const w=vertical?baseH:baseW,h=vertical?baseW:baseH;
  const shape=['rectangle','rounded','round'].includes(t.shape)?t.shape:'rounded';
  const x=Math.max(0,Math.min(96,Number(t.x)||0)),y=Math.max(0,Math.min(92,Number(t.y)||0));
  return `<button type="button" class="${cls} table-shape-${shape}${settingsMode?'':' '+tableStatusClass(t)}" data-${settingsMode?'settings-':'select-'}table-id="${t.id}" data-rotation="${rotation}" style="left:${x}%;top:${y}%;width:${w}px;height:${h}px"><b>${esc(t.number)}</b><span>${esc(t.name)}</span><small>${t.seats} pl.</small></button>`;
}
function floorPlanModalHtml(roomId){
  const room=roomById(roomId);if(!room)return '<div class="empty">Aucune salle</div>';
  const tables=state.tables.filter(t=>Number(t.roomId)===Number(room.id));
  return `<div class="floor-plan-modal"><div class="muted floor-plan-help">Choisissez une salle puis touchez une table.</div>${roomTabsHtml(room.id)}<div class="floor-plan-stage">${tables.map(t=>floorPlanTableHtml(t)).join('')||'<div class="floor-plan-empty">Aucune table dans cette salle.</div>'}</div><div class="floor-legend"><span>🟢 Libre</span><span>🟠 Occupée</span><span>🔵 Réservée</span></div></div>`;
}
function openFloorPlan(roomId=state.posRoomId){
  state.posRoomId=roomById(roomId)?.id||state.rooms[0]?.id||null;save();
  modal('🗺️ Plan de salle',floorPlanModalHtml(state.posRoomId));
}
qsa('.mode').forEach(b=>b.onclick=()=>{
  state.currentMode=b.dataset.mode;state.tableId=null;state.cart=[];state.sent=false;state.dirty=false;
  const quick=qs('#quickTableNumber');if(quick)quick.value='';
  qsa('.mode').forEach(x=>x.classList.toggle('active',x===b));renderContext();renderCart();renderTables();save()
});
const quickTableInput=qs('#quickTableNumber');
if(quickTableInput)quickTableInput.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();openTableByNumber()}};
function renderContext(){
  let x=state.currentMode==='takeaway'?'Commande à emporter':state.currentMode==='delivery'?'Commande livraison':'Choisissez une table';
  if(state.currentMode==='table'&&state.tableId){const t=state.tables.find(t=>t.id===state.tableId);if(t)x=`${tableRoomName(t)} · ${t.name}`;}
  qs('#orderContext').textContent=x
}
function renderCategories(){
  const cats=[...new Set(state.products.map(p=>p.cat))],w=qs('#categories');w.innerHTML='';
  cats.forEach(c=>{const b=document.createElement('button');b.className='category'+(state.category===c?' active':'');b.textContent=c;b.onclick=()=>{state.category=c;renderCategories();renderProducts()};w.appendChild(b)})
}
function renderProducts(){
  const w=qs('#products');w.innerHTML='';
  state.products.filter(p=>p.cat===state.category).forEach(p=>{
    const b=document.createElement('button');b.className='product';
    b.innerHTML=`<b>${esc(p.name)}</b><div class="meta">${esc(p.station)} · TVA ${p.vat}% · Stock ${p.stock}</div><div class="price">${money(p.price)}</div>`;
    b.onclick=()=>addProduct(p);w.appendChild(b)
  })
}

function cartSegments(items){
  const segments=[];
  let current=[];
  items.forEach(item=>{
    current.push({...item});
    if(item.separatorAfter){
      segments.push(current);
      current=[];
    }
  });
  if(current.length)segments.push(current);
  return segments;
}
function mergeSegmentItems(segment){
  const merged=[];
  const byKey=new Map();
  segment.forEach(item=>{
    // Un même article est regroupé seulement s'il appartient au même service.
    // Cela évite de mélanger un article placé volontairement dans un autre service.
    const key=`${item.id}|${item.service||''}|${item.station||''}|${item.price}|${item.cooking||''}|${item.sauce||''}|${item.accompaniment||''}|${item.kitchenNote||''}`;
    if(byKey.has(key)){
      const target=byKey.get(key);
      target.qty=Number(target.qty||0)+Number(item.qty||0);
    }else{
      const copy={...item,qty:Number(item.qty||1),separatorAfter:false};
      merged.push(copy);
      byKey.set(key,copy);
    }
  });
  return merged;
}
function consolidateCart(items=state.cart){
  const original=items||[];
  if(!original.length)return [];
  const hadFinalSeparator=Boolean(original[original.length-1]?.separatorAfter);
  const segments=cartSegments(original);
  const out=[];
  segments.forEach((segment,idx)=>{
    const merged=mergeSegmentItems(segment);
    // La séparation manuelle reste exactement entre les mêmes groupes.
    const segmentEndedWithSeparator=Boolean(segment[segment.length-1]?.separatorAfter);
    if(merged.length && segmentEndedWithSeparator){
      merged[merged.length-1].separatorAfter=true;
    }
    out.push(...merged);
  });
  if(out.length && !hadFinalSeparator && out[out.length-1].separatorAfter){
    out[out.length-1].separatorAfter=false;
  }
  return out;
}
function currentManualSegmentStart(){
  for(let i=state.cart.length-1;i>=0;i--){
    if(state.cart[i].separatorAfter)return i+1;
  }
  return 0;
}

function productRequiresConfiguration(p){
  // Le popup s'ouvre lorsqu'un choix immédiat est réellement demandé.
  // Un simple message cuisine autorisé ne force pas le popup à lui seul.
  return Boolean(p.askCooking || p.askSauce || p.accompanimentGroupId);
}
function defaultServiceForProduct(p){
  return ({Entrées:'Entrée',Plats:'Plat',Desserts:'Dessert',Boissons:'Boisson'}[p.cat]||'Plat');
}
function productConfiguratorHtml(p){
  const group=getAccompanimentGroup(p.accompanimentGroupId);
  const cookingValues=['Bleu','Saignant','À point','Bien cuit'];
  const sauceValues=['Sans sauce','Béarnaise','Poivre','Champignons','Liégeoise','Mayonnaise','Autre'];

  return `<div class="product-configurator">
    <div class="configurator-product">
      <div><b>${esc(p.name)}</b><div class="muted">${esc(p.cat)} · ${money(p.price)}</div></div>
      <b>${money(p.price)}</b>
    </div>

    ${p.askCooking?`<div class="configurator-section"><h4>🔥 Cuisson</h4><div class="configurator-options">${cookingValues.map(v=>`<button type="button" class="config-option config-cooking" data-value="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`:''}

    ${p.askSauce?`<div class="configurator-section"><h4>🥣 Sauce</h4><div class="configurator-options">${sauceValues.map(v=>`<button type="button" class="config-option config-sauce" data-value="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`:''}

    ${group?`<div class="configurator-section"><h4>🍟 Accompagnement</h4><div class="configurator-options">${group.items.map(v=>`<button type="button" class="config-option config-accompaniment" data-value="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`:''}

    ${p.allowKitchenMessage?`<div class="configurator-section"><h4>💬 Message cuisine <span class="muted">(facultatif)</span></h4><div class="configurator-options">${state.kitchenMessages.map(v=>`<button type="button" class="config-option config-message" data-value="${esc(v)}">${esc(v)}</button>`).join('')}</div><input id="configCustomMessage" class="configurator-note" placeholder="Ou écrire un message libre..."></div>`:''}

    <div class="configurator-footer"><button id="cancelProductConfig" class="secondary">Annuler</button><button id="confirmProductConfig" class="primary">Ajouter à la commande</button></div>
  </div>`;
}
function addConfiguredProduct(p,config={}){
  if(p.stock<=0)return toast('Produit en rupture');
  const item={...p,qty:1,separatorAfter:false,service:defaultServiceForProduct(p),cooking:config.cooking||'',sauce:config.sauce||'',accompaniment:config.accompaniment||'',kitchenNote:config.kitchenNote||''};
  const start=currentManualSegmentStart();
  const existing=state.cart.slice(start).find(i=>Number(i.id)===Number(item.id)&&(i.service||'')===item.service&&(i.cooking||'')===item.cooking&&(i.sauce||'')===item.sauce&&(i.accompaniment||'')===item.accompaniment&&(i.kitchenNote||'')===item.kitchenNote);
  if(existing)existing.qty=Number(existing.qty||0)+1; else state.cart.push(item);
  state.cart=consolidateCart(state.cart);
  state.sent=false;state.dirty=true;save();renderCart();
}
function addProduct(p){
  if(p.stock<=0)return toast('Produit en rupture');
  if(productRequiresConfiguration(p)){
    pendingProductConfig={productId:p.id,cooking:'',sauce:'',accompaniment:'',kitchenNote:''};
    modal(`Configurer — ${p.name}`,productConfiguratorHtml(p));
    return;
  }
  addConfiguredProduct(p,{});
}
function changeQty(i,d){
  i.qty+=d;
  if(i.qty<=0)state.cart=state.cart.filter(x=>x!==i);
  state.cart=consolidateCart(state.cart);
  state.sent=false;state.dirty=true;save();renderCart()
}
function getAccompanimentGroup(id){
  return state.accompanimentGroups.find(g=>Number(g.id)===Number(id))||null;
}
function renderCart(){
  const w=qs('#cart');w.innerHTML='';
  if(!state.cart.length)w.innerHTML='<div class="empty">Aucun article</div>';

  state.cart.forEach((i,idx)=>{
    const d=document.createElement('div');d.className='cart-item';
    const cookingValues=['Bleu','Saignant','À point','Bien cuit'];
    const sauceValues=['Sans sauce','Béarnaise','Poivre','Champignons','Liégeoise','Mayonnaise','Autre'];
    const group=getAccompanimentGroup(i.accompanimentGroupId);

    const cookingSelect=i.askCooking?`<select class="cooking"><option value="">🔥 Choisir cuisson</option>${cookingValues.map(v=>`<option value="${v}" ${i.cooking===v?'selected':''}>${v}</option>`).join('')}</select>`:'';
    const sauceSelect=i.askSauce?`<select class="sauce"><option value="">🥣 Choisir sauce</option>${sauceValues.map(v=>`<option value="${v}" ${i.sauce===v?'selected':''}>${v}</option>`).join('')}</select>`:'';
    const accompanimentSelect=group?`<select class="accompaniment"><option value="">🍟 Choisir accompagnement</option>${group.items.map(v=>`<option value="${esc(v)}" ${i.accompaniment===v?'selected':''}>${esc(v)}</option>`).join('')}</select>`:'';
    const quickMessages=i.allowKitchenMessage?`<div class="message-row">${state.kitchenMessages.map(m=>`<button type="button" class="quick-message ${i.kitchenNote===m?'active':''}" data-message="${esc(m)}">${esc(m)}</button>`).join('')}<button type="button" class="custom-note-btn">✍️ Message libre</button></div>`:'';
    const summaries=[];
    if(i.cooking)summaries.push(`🔥 Cuisson : ${esc(i.cooking)}`);
    if(i.sauce)summaries.push(`🥣 Sauce : ${esc(i.sauce)}`);
    if(i.accompaniment)summaries.push(`🍟 Accompagnement : ${esc(i.accompaniment)}`);
    if(i.kitchenNote)summaries.push(`💬 ${esc(i.kitchenNote)}`);

    d.innerHTML=`<div class="item-top"><div><b>${esc(i.name)}</b><div class="muted">${esc(i.station)} · TVA ${i.vat}%</div></div><b>${money(i.price*i.qty)}</b></div>
      <div class="qty"><button class="minus">−</button><b>${i.qty}</b><button class="plus">+</button></div>
      ${(i.askCooking||i.askSauce)?`<div class="item-options">${cookingSelect}${sauceSelect}</div>`:''}
      ${group?`<div class="item-extra-options">${accompanimentSelect}</div>`:''}
      ${quickMessages}
      ${summaries.length?`<div class="option-summary">${summaries.join(' · ')}</div>`:''}
      <div class="item-controls"><select class="service"><option>Entrée</option><option>Plat</option><option>Dessert</option><option>Boisson</option></select><button class="separator ${i.separatorAfter?'active':''}">${i.separatorAfter?'✓ Retirer ligne':'➖ Ligne après'}</button></div>`;

    const service=d.querySelector('.service');service.value=i.service||'Plat';
    service.onchange=e=>{i.service=e.target.value;state.cart=consolidateCart(state.cart);state.sent=false;state.dirty=true;save();renderCart()};
    const cooking=d.querySelector('.cooking');if(cooking)cooking.onchange=e=>{i.cooking=e.target.value;state.cart=consolidateCart(state.cart);state.sent=false;state.dirty=true;save();renderCart()};
    const sauce=d.querySelector('.sauce');if(sauce)sauce.onchange=e=>{i.sauce=e.target.value;state.cart=consolidateCart(state.cart);state.sent=false;state.dirty=true;save();renderCart()};
    const accompaniment=d.querySelector('.accompaniment');if(accompaniment)accompaniment.onchange=e=>{i.accompaniment=e.target.value;state.cart=consolidateCart(state.cart);state.sent=false;state.dirty=true;save();renderCart()};

    d.querySelectorAll('.quick-message').forEach(btn=>btn.onclick=()=>{const msg=btn.dataset.message;i.kitchenNote=i.kitchenNote===msg?'':msg;state.cart=consolidateCart(state.cart);state.sent=false;state.dirty=true;save();renderCart()});
    const customBtn=d.querySelector('.custom-note-btn');if(customBtn)customBtn.onclick=()=>modal('Message cuisine',`<div class="form-grid"><label class="span3">Message pour la cuisine<input id="customKitchenNote" value="${esc(i.kitchenNote||'')}" placeholder="Ex. sans salade, sauce à part..."></label><button id="saveCustomKitchenNote" data-cart-index="${idx}" class="primary span3">Enregistrer le message</button></div>`);

    d.querySelector('.minus').onclick=()=>changeQty(i,-1);
    d.querySelector('.plus').onclick=()=>changeQty(i,1);
    d.querySelector('.separator').onclick=()=>{i.separatorAfter=!i.separatorAfter;state.sent=false;state.dirty=true;save();renderCart()};
    w.appendChild(d);
    if(i.separatorAfter&&idx<state.cart.length-1){const sep=document.createElement('div');sep.className='manual-sep';w.appendChild(sep)}
  });

  const total=state.cart.reduce((s,i)=>s+i.price*i.qty,0);
  qs('#subtotal').textContent=money(total);qs('#total').textContent=money(total);qs('#payBtn').textContent=`PAYER ${money(total)}`;
  qs('#payBtn').disabled=!state.cashOpen||!state.sent||state.dirty||!state.cart.length;
  qs('#orderStatus').classList.toggle('hidden',!state.sent);qs('#orderStatus').textContent=state.sent?'✓ Commande envoyée — prête à encaisser':'';
}
qs('#clearCartBtn').onclick=()=>{if(!state.cart.length)return;state.cart=[];state.sent=false;state.dirty=false;save();renderCart()};

function ticketVariantKey(i){
  return [i.cooking||'',i.sauce||'',i.accompaniment||'',i.kitchenNote||'',i.service||''].join('|');
}
function buildTicketProductGroups(items){
  const segments=cartSegments(items);
  const result=[];
  segments.forEach(segment=>{
    const segmentGroups=[];
    const productMap=new Map();
    segment.forEach(i=>{
      const productKey=`${i.id}|${i.station||''}|${i.price}`;
      let group=productMap.get(productKey);
      if(!group){
        group={id:i.id,name:i.name,station:i.station,totalQty:0,variants:[],separatorAfter:false};
        productMap.set(productKey,group);
        segmentGroups.push(group);
      }
      group.totalQty+=Number(i.qty||1);
      const variantKey=ticketVariantKey(i);
      let variant=group.variants.find(v=>v.key===variantKey);
      if(!variant){
        variant={key:variantKey,qty:0,cooking:i.cooking||'',sauce:i.sauce||'',accompaniment:i.accompaniment||'',kitchenNote:i.kitchenNote||'',service:i.service||''};
        group.variants.push(variant);
      }
      variant.qty+=Number(i.qty||1);
    });
    if(segmentGroups.length && segment[segment.length-1]?.separatorAfter){
      segmentGroups[segmentGroups.length-1].separatorAfter=true;
    }
    result.push(...segmentGroups);
  });
  return result;
}
function ticketVariantText(v){
  const parts=[];
  if(v.cooking)parts.push(`🔥 ${esc(v.cooking)}`);
  if(v.sauce)parts.push(`🥣 ${esc(v.sauce)}`);
  if(v.accompaniment)parts.push(`🍟 ${esc(v.accompaniment)}`);
  return parts.join(' · ');
}
function ticketProductGroupHtml(group){
  const showVariants=group.variants.some(v=>v.cooking||v.sauce||v.accompaniment||v.kitchenNote);
  const variantsHtml=showVariants ? group.variants.map(v=>{
    const optionText=ticketVariantText(v);
    return `<div class="ticket-variant">↳ ${v.qty} × ${optionText||'Sans option spéciale'}</div>${v.kitchenNote?`<div class="ticket-variant-note">💬 ${esc(v.kitchenNote)}</div>`:''}`;
  }).join('') : '';
  return `<div class="ticket-product-group"><div class="ticket-product-title">${group.totalQty} × ${esc(group.name)}</div>${variantsHtml}</div>${group.separatorAfter?'<div class="sep"></div>':''}`;
}
function ticketGroupsByStation(items){
  const grouped=buildTicketProductGroups(items);
  const stations={Cuisine:[],Bar:[],Dessert:[]};
  grouped.forEach(g=>(stations[g.station]||stations.Cuisine).push(g));
  return stations;
}

qs('#sendOrderBtn').onclick=()=>{
  if(!state.cashOpen)return toast('Ouvrez la caisse');
  if(!state.cart.length)return toast('Commande vide');
  if(state.currentMode==='table'&&!state.tableId)return toast('Choisissez une table');

  // Regroupement final juste avant l'envoi.
  // Exemple : Coca → Bière → Coca devient 2 × Coca + 1 × Bière.
  // Les lignes de séparation manuelles restent respectées.
  state.cart=consolidateCart(state.cart);

  if(state.currentMode==='table')state.openOrders[state.tableId]={items:structuredClone(state.cart),sentAt:new Date().toISOString()};
  state.sent=true;state.dirty=false;save();renderTables();renderCart();
  const groups=ticketGroupsByStation(state.cart);

  modal('Tickets envoyés — v2.20',
    Object.entries(groups)
      .filter(([,items])=>items.length)
      .map(([station,items])=>`<div class="ticket"><b>${station.toUpperCase()}</b><hr>${items.map(ticketProductGroupHtml).join('')}</div>`)
      .join('')
  )
};
qs('#transferTableBtn').onclick=()=>{
  if(state.currentMode!=='table'||!state.tableId)return toast('Choisissez une table');
  const options=state.tables.filter(t=>t.id!==state.tableId&&!state.openOrders[t.id]);
  modal('Transférer la table',`<div class="tables">${options.map(t=>`<button class="table-btn transfer" data-id="${t.id}"><b>${esc(t.name)}</b><br><small>${t.seats} places</small></button>`).join('')}</div>`);
  qsa('.transfer').forEach(b=>b.onclick=()=>{const to=Number(b.dataset.id);state.openOrders[to]=state.openOrders[state.tableId]||{items:structuredClone(state.cart)};delete state.openOrders[state.tableId];state.tableId=to;save();renderTables();renderContext();closeModal();toast('Table transférée')})
};
qs('#splitBillBtn').onclick=()=>{
  if(!state.sent||state.dirty)return toast('Envoyez d’abord la commande');
  const q=state.cart.map(()=>0);
  modal('Séparer la note',`${state.cart.map((i,n)=>`<div class="admin-row"><div>${esc(i.name)}</div><div>Dispo ${i.qty}</div><div><button class="sminus" data-i="${n}">−</button> <b id="sq${n}">0</b> <button class="splus" data-i="${n}">+</button></div><b>${money(i.price)}</b></div>`).join('')}<div class="summary"><div class="total"><span>Total sélection</span><b id="splitTotal">0,00 €</b></div></div>`);
  qs('#modalBody').onclick=e=>{const i=Number(e.target.dataset.i);if(e.target.classList.contains('splus'))q[i]=Math.min(state.cart[i].qty,q[i]+1);if(e.target.classList.contains('sminus'))q[i]=Math.max(0,q[i]-1);let t=0;q.forEach((n,j)=>{qs(`#sq${j}`).textContent=n;t+=n*state.cart[j].price});qs('#splitTotal').textContent=money(t)}
};
qsa('.pay').forEach(b=>b.onclick=()=>{qsa('.pay').forEach(x=>x.classList.toggle('active',x===b));state.payment=b.dataset.pay;save()});
qs('#payBtn').onclick=()=>{
  if(qs('#payBtn').disabled)return;
  const total=state.cart.reduce((s,i)=>s+i.price*i.qty,0),vat={6:0,12:0,21:0};
  state.cart.forEach(i=>{const t=i.price*i.qty;vat[i.vat]+=t-t/(1+i.vat/100);const p=state.products.find(p=>p.id===i.id);if(p)p.stock=Math.max(0,p.stock-i.qty)});
  state.payments.push({id:Date.now(),date:new Date().toISOString(),total,method:state.payment,vat,items:structuredClone(state.cart)});
  if(state.tableId)delete state.openOrders[state.tableId];
  const receipt=`<div class="ticket"><div style="text-align:center"><b>${esc(state.settings.establishmentName)}</b><br>Ticket démo</div><hr>${state.cart.map(i=>`<div style="display:flex;justify-content:space-between"><span>${i.qty} × ${esc(i.name)}</span><b>${money(i.qty*i.price)}</b></div>`).join('')}<hr><div style="display:flex;justify-content:space-between;font-size:18px"><b>TOTAL</b><b>${money(total)}</b></div><hr>${[6,12,21].filter(r=>vat[r]>0).map(r=>`TVA ${r}% : ${money(vat[r])}<br>`).join('')}</div>`;
  state.cart=[];state.sent=false;state.dirty=false;state.tableId=null;save();renderAll();modal('Ticket client',receipt)
};

function validateReservation(x,editingId=null){
  const s=state.settings;
  if(!x.customerName)return 'Nom du client requis';
  if(!x.date||!x.time)return 'Date et heure requises';
  if(s.phoneRequired&&!x.phone)return 'Téléphone obligatoire';
  if(x.partySize>s.maxPartySize&&!x.overrideLimits)return `Maximum ${s.maxPartySize} personnes`;
  if(!s.allowUnassignedTable&&!x.tableId)return 'Une table doit être attribuée';
  const req=new Date(`${x.date}T${x.time}:00`),now=new Date();
  if(x.source!=='walk_in'&&!x.overrideLimits){
    if(req-now<s.minLeadMinutes*60000)return `Réservation au moins ${Math.round(s.minLeadMinutes/60*10)/10} h avant`;
    const max=new Date();max.setDate(max.getDate()+s.maxAdvanceDays);if(req>max)return `Maximum ${s.maxAdvanceDays} jours à l’avance`;
    const tm=timeToMinutes(x.time),windows=[];if(s.lunchEnabled)windows.push([timeToMinutes(s.lunchStart),timeToMinutes(s.lunchEnd)]);if(s.dinnerEnabled)windows.push([timeToMinutes(s.dinnerStart),timeToMinutes(s.dinnerEnd)]);
    if(s.enforceServiceHours&&!windows.some(([a,b])=>tm>=a&&tm<=b))return 'Heure en dehors des services';
    const active=state.reservations.filter(r=>r.date===x.date&&!['cancelled','no_show','finished'].includes(r.status)&&r.id!==editingId);
    if(active.length>=s.maxReservationsPerDay)return `Limite de ${s.maxReservationsPerDay} réservations atteinte`;
    if(active.reduce((a,r)=>a+Number(r.partySize||0),0)+x.partySize>s.maxCoversPerDay)return `Limite de ${s.maxCoversPerDay} couverts atteinte`;
  }
  if(x.tableId&&!x.overrideLimits){
    const start=timeToMinutes(x.time),end=start+x.durationMinutes;
    const conflict=state.reservations.find(r=>r.id!==editingId&&r.date===x.date&&Number(r.tableId)===Number(x.tableId)&&!['cancelled','no_show','finished'].includes(r.status)&&start<timeToMinutes(r.time)+Number(r.durationMinutes||120)&&end>timeToMinutes(r.time));
    if(conflict)return `Table déjà réservée à ${conflict.time}`;
  }
  return null
}
function reservationForm(r=null,preset=null){
  const x=r||{},s=state.settings;
  return `<div class="form-grid">
  <label class="span2">Nom du client<input id="rName" value="${esc(x.customerName||'')}"></label>
  <label>Personnes<input id="rPax" type="number" min="1" value="${Number(x.partySize||2)}"></label>
  <label>Téléphone<input id="rPhone" value="${esc(x.phone||'')}"></label>
  <label>E-mail<input id="rEmail" type="email" value="${esc(x.email||'')}"></label>
  <label>Langue<select id="rLang"><option value="fr">Français</option><option value="en">Anglais</option><option value="sq">Albanais</option><option value="nl">Néerlandais</option><option value="de">Allemand</option></select></label>
  <label>Date<input id="rDate" type="date" value="${esc(x.date||state.reservationDate||localDateISO())}"></label>
  <label>Heure<input id="rTime" type="time" value="${esc(x.time||preset||s.dinnerStart)}"></label>
  <label>Durée<select id="rDuration">${[60,90,120,150,180,240].map(v=>`<option value="${v}" ${Number(x.durationMinutes||s.defaultDurationMinutes)===v?'selected':''}>${v} min</option>`).join('')}</select></label>
  <label>Table<select id="rTable"><option value="">Non attribuée</option>${state.tables.map(t=>`<option value="${t.id}" ${Number(x.tableId)===t.id?'selected':''}>${esc(t.name)} — ${t.seats} places</option>`).join('')}</select></label>
  <label>Zone<select id="rArea"><option value="">Non précisée</option><option value="salle">Salle</option><option value="terrasse">Terrasse</option><option value="bar">Bar</option><option value="prive">Espace privé</option></select></label>
  <label>Origine<select id="rSource"><option value="phone">Téléphone</option><option value="website">Site web</option><option value="walk_in">Passage</option><option value="email">E-mail</option><option value="social">Réseaux sociaux</option><option value="other">Autre</option></select></label>
  <label>Occasion<select id="rOccasion"><option value="">Aucune</option><option value="anniversaire">Anniversaire</option><option value="business">Business</option><option value="famille">Famille</option><option value="groupe">Groupe</option><option value="autre">Autre</option></select></label>
  <label>Statut<select id="rStatus"><option value="booked">Réservée</option><option value="arrived">Arrivé</option><option value="finished">Terminée</option><option value="no_show">No-show</option><option value="cancelled">Annulée</option></select></label>
  <label class="span3">Note client<textarea id="rNotes">${esc(x.notes||'')}</textarea></label>
  <label class="span3">Note interne<textarea id="rInternal">${esc(x.internalNotes||'')}</textarea></label>
  ${isManager()&&s.staffCanOverrideLimits?'<label class="checkline span3"><input id="rOverride" type="checkbox"> Dépasser exceptionnellement les limites</label>':''}
  <button id="${r?'saveResEdit':'saveRes'}" ${r?`data-id="${r.id}"`:''} class="primary span3">${r?'Enregistrer':'Créer la réservation'}</button></div>`;
}
function readResForm(existing='booked'){return{customerName:qs('#rName').value.trim(),partySize:Number(qs('#rPax').value||2),phone:qs('#rPhone').value.trim(),email:qs('#rEmail').value.trim(),customerLanguage:qs('#rLang').value,date:qs('#rDate').value,time:qs('#rTime').value,durationMinutes:Number(qs('#rDuration').value||120),tableId:qs('#rTable').value?Number(qs('#rTable').value):null,area:qs('#rArea').value,source:qs('#rSource').value,occasion:qs('#rOccasion').value,status:qs('#rStatus').value||existing,notes:qs('#rNotes').value.trim(),internalNotes:qs('#rInternal').value.trim(),overrideLimits:Boolean(qs('#rOverride')?.checked)}}
function renderReservations(){
  if(!state.reservationDate)state.reservationDate=localDateISO();
  qs('#reservationDate').value=state.reservationDate;qs('#reservationEstablishmentName').textContent=state.settings.establishmentName;
  const todays=state.reservations.filter(r=>r.date===state.reservationDate),active=todays.filter(r=>!['cancelled','no_show','finished'].includes(r.status)),covers=active.reduce((s,r)=>s+Number(r.partySize||0),0);
  qs('#reservationStats').innerHTML=`<div class="stat"><span>Réservations actives</span><b>${active.length}</b></div><div class="stat"><span>À venir</span><b>${todays.filter(r=>r.status==='booked').length}</b></div><div class="stat"><span>Arrivés</span><b>${todays.filter(r=>r.status==='arrived').length}</b></div><div class="stat"><span>Couverts</span><b>${covers}/${state.settings.maxCoversPerDay}</b></div><div class="stat"><span>Réservations restantes</span><b>${Math.max(0,state.settings.maxReservationsPerDay-active.length)}</b></div>`;
  qs('#reservationCapacityLabel').textContent=`${Math.max(0,state.settings.maxReservationsPerDay-active.length)} réservations · ${Math.max(0,state.settings.maxCoversPerDay-covers)} couverts disponibles`;
  const slots=[];const add=(on,a,b,l)=>{if(!on)return;for(let m=timeToMinutes(a);m<=timeToMinutes(b);m+=state.settings.slotIntervalMinutes)slots.push({time:`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`,label:l})};add(state.settings.lunchEnabled,state.settings.lunchStart,state.settings.lunchEnd,'Midi');add(state.settings.dinnerEnabled,state.settings.dinnerStart,state.settings.dinnerEnd,'Soir');
  qs('#reservationSlots').innerHTML=slots.map(s=>{const at=todays.filter(r=>r.time===s.time&&!['cancelled','no_show','finished'].includes(r.status));return `<div class="slot"><div class="time">${s.time}</div><div><b>${s.label}</b><br><small>${at.length} rés. · ${at.reduce((x,r)=>x+r.partySize,0)} couverts</small></div><button class="newAtSlot" data-time="${s.time}">+</button></div>`}).join('');
  const q=state.reservationSearch.toLowerCase(),status=state.reservationStatusFilter;
  const list=todays.filter(r=>(status==='all'||r.status===status)&&(!q||[r.customerName,r.phone,r.email,r.notes].some(v=>String(v||'').toLowerCase().includes(q)))).sort((a,b)=>a.time.localeCompare(b.time));
  qs('#reservationListTitle').textContent=`Réservations du ${new Date(state.reservationDate+'T12:00:00').toLocaleDateString('fr-BE')}`;qs('#reservationListCount').textContent=`${list.length} résultat(s)`;
  qs('#reservationList').innerHTML=list.map(r=>`<div class="res-card ${r.status}"><div class="time">${esc(r.time)}</div><div><div class="client">${esc(r.customerName)}</div><div class="muted">${esc(r.phone||'Sans téléphone')}</div><div class="tags"><span class="tag">${esc(r.source||'phone')}</span>${r.occasion?`<span class="tag">${esc(r.occasion)}</span>`:''}${r.area?`<span class="tag">${esc(r.area)}</span>`:''}</div></div><div><b>${r.partySize} pers.</b><div class="muted">${r.durationMinutes} min</div></div><div><b>${esc(state.tables.find(t=>t.id===r.tableId)?.name||'Non attribuée')}</b><div class="muted">${esc(r.status)}</div></div><div>${r.notes?esc(r.notes):'<span class="muted">Aucune note</span>'}</div><div class="buttons">${r.status==='booked'?`<button class="arrive resArrive" data-id="${r.id}">Arrivé</button>`:''}<button class="resEdit" data-id="${r.id}">Modifier</button>${!['cancelled','finished'].includes(r.status)?`<button class="cancel resCancel" data-id="${r.id}">Annuler</button>`:''}</div></div>`).join('')||'<div class="empty">Aucune réservation</div>';
}
function settingsForm(){
  const s=state.settings;
  return `<div class="form-grid"><label class="span3">Établissement<input id="sName" value="${esc(s.establishmentName)}"></label><label>Max réservations / jour<input id="sMaxRes" type="number" value="${s.maxReservationsPerDay}"></label><label>Max couverts / jour<input id="sMaxCovers" type="number" value="${s.maxCoversPerDay}"></label><label>Max personnes / réservation<input id="sMaxParty" type="number" value="${s.maxPartySize}"></label><label>Délai minimum avant arrivée (min)<input id="sLead" type="number" step="15" value="${s.minLeadMinutes}"></label><label>Jours max à l’avance<input id="sAdvance" type="number" value="${s.maxAdvanceDays}"></label><label>Intervalle créneaux<select id="sSlot"><option>15</option><option ${s.slotIntervalMinutes===30?'selected':''}>30</option><option>60</option></select></label><label>Durée par défaut<input id="sDuration" type="number" value="${s.defaultDurationMinutes}"></label><label>Midi actif<select id="sLunchOn"><option value="1" ${s.lunchEnabled?'selected':''}>Oui</option><option value="0" ${!s.lunchEnabled?'selected':''}>Non</option></select></label><label>Début midi<input id="sLunchStart" type="time" value="${s.lunchStart}"></label><label>Fin midi<input id="sLunchEnd" type="time" value="${s.lunchEnd}"></label><label>Soir actif<select id="sDinnerOn"><option value="1" ${s.dinnerEnabled?'selected':''}>Oui</option><option value="0" ${!s.dinnerEnabled?'selected':''}>Non</option></select></label><label>Début soir<input id="sDinnerStart" type="time" value="${s.dinnerStart}"></label><label>Fin soir<input id="sDinnerEnd" type="time" value="${s.dinnerEnd}"></label><label>Téléphone obligatoire<select id="sPhone"><option value="1" ${s.phoneRequired?'selected':''}>Oui</option><option value="0" ${!s.phoneRequired?'selected':''}>Non</option></select></label><label>Table non attribuée autorisée<select id="sUnassigned"><option value="1" ${s.allowUnassignedTable?'selected':''}>Oui</option><option value="0" ${!s.allowUnassignedTable?'selected':''}>Non</option></select></label><label>Responsable peut dépasser<select id="sOverride"><option value="1" ${s.staffCanOverrideLimits?'selected':''}>Oui</option><option value="0" ${!s.staffCanOverrideLimits?'selected':''}>Non</option></select></label><button id="saveResSettings" class="primary span3">Enregistrer les paramètres</button></div>`
}
qs('#newReservationBtn').onclick=()=>modal('Nouvelle réservation',reservationForm());
qs('#reservationSettingsBtn').onclick=()=>modal('Paramètres réservations',settingsForm());
qs('#resPrevDayBtn').onclick=()=>{state.reservationDate=shiftDate(state.reservationDate,-1);save();renderReservations()};qs('#resTodayBtn').onclick=()=>{state.reservationDate=localDateISO();save();renderReservations()};qs('#resNextDayBtn').onclick=()=>{state.reservationDate=shiftDate(state.reservationDate,1);save();renderReservations()};
qs('#reservationDate').onchange=e=>{state.reservationDate=e.target.value;save();renderReservations()};qs('#reservationSearch').oninput=e=>{state.reservationSearch=e.target.value;renderReservations()};qs('#reservationStatusFilter').onchange=e=>{state.reservationStatusFilter=e.target.value;renderReservations()};

function accompanimentGroupForm(group=null){
  const g=group||{};
  return `<div class="form-grid"><label class="span3">Nom de la famille<input id="agName" value="${esc(g.name||'')}"></label><label class="span3">Accompagnements (un par ligne)<textarea id="agItems" rows="8">${esc((g.items||[]).join('\n'))}</textarea></label><button id="${group?'saveAccompanimentGroupEdit':'saveAccompanimentGroup'}" ${group?`data-id="${group.id}"`:''} class="primary span3">${group?'Enregistrer':'Créer la famille'}</button></div>`;
}
function kitchenMessageForm(message=null,index=null){
  return `<div class="form-grid"><label class="span3">Message rapide<input id="kmText" value="${esc(message||'')}"></label><button id="${index!==null?'saveKitchenMessageEdit':'saveKitchenMessage'}" ${index!==null?`data-index="${index}"`:''} class="primary span3">${index!==null?'Enregistrer':'Ajouter le message'}</button></div>`;
}
function renderKitchenOptions(){
  qs('#accompanimentGroupsList').innerHTML=state.accompanimentGroups.map(g=>`<div class="admin-row"><div><b>${esc(g.name)}</b><div class="group-items">${g.items.map(i=>`<span class="group-chip">${esc(i)}</span>`).join('')}</div></div><div>${g.items.length} choix</div><div></div><div><button class="editAccompanimentGroup" data-id="${g.id}">Modifier</button> <button class="deleteAccompanimentGroup" data-id="${g.id}">Supprimer</button></div></div>`).join('')||'<div class="empty">Aucune famille</div>';
  qs('#kitchenMessagesList').innerHTML=state.kitchenMessages.map((m,idx)=>`<div class="admin-row"><div><b>${esc(m)}</b></div><div></div><div></div><div><button class="editKitchenMessage" data-index="${idx}">Modifier</button> <button class="deleteKitchenMessage" data-index="${idx}">Supprimer</button></div></div>`).join('')||'<div class="empty">Aucun message rapide</div>';
}
qs('#newAccompanimentGroupBtn').onclick=()=>modal('Nouvelle famille d’accompagnements',accompanimentGroupForm());
qs('#newKitchenMessageBtn').onclick=()=>modal('Nouveau message cuisine',kitchenMessageForm());

function renderProductsAdmin(){
  qs('#productsAdmin').innerHTML=state.products.map(p=>`<div class="admin-row"><div><b>${esc(p.name)}</b><div class="muted">${esc(p.cat)} · ${esc(p.station)}</div></div><div>${money(p.price)}</div><div>TVA ${p.vat}%</div><div><button class="editProduct" data-id="${p.id}">Modifier</button></div></div>`).join('')
}
qs('#newProductBtn').onclick=()=>modal('Nouveau produit',productForm());
function productForm(p=null){
  const x=p||{};
  return `<div class="form-grid">
    <label class="span2">Nom<input id="pName" value="${esc(x.name||'')}"></label>
    <label>Catégorie<select id="pCat">${['Entrées','Plats','Desserts','Boissons'].map(c=>`<option ${x.cat===c?'selected':''}>${c}</option>`).join('')}</select></label>
    <label>Prix TTC<input id="pPrice" type="number" step="0.01" value="${x.price||0}"></label>
    <label>TVA<select id="pVat">${[6,12,21].map(v=>`<option ${x.vat===v?'selected':''}>${v}</option>`).join('')}</select></label>
    <label>Station<select id="pStation">${['Cuisine','Bar','Dessert'].map(c=>`<option ${x.station===c?'selected':''}>${c}</option>`).join('')}</select></label>
    <label>Demander cuisson<select id="pAskCooking"><option value="0" ${!x.askCooking?'selected':''}>Non</option><option value="1" ${x.askCooking?'selected':''}>Oui</option></select></label>
    <label>Demander sauce<select id="pAskSauce"><option value="0" ${!x.askSauce?'selected':''}>Non</option><option value="1" ${x.askSauce?'selected':''}>Oui</option></select></label>
    <label>Famille accompagnements<select id="pAccompanimentGroup"><option value="">Aucune</option>${state.accompanimentGroups.map(g=>`<option value="${g.id}" ${Number(x.accompanimentGroupId)===Number(g.id)?'selected':''}>${esc(g.name)}</option>`).join('')}</select></label>
    <label>Messages cuisine<select id="pAllowKitchenMessage"><option value="1" ${x.allowKitchenMessage!==false?'selected':''}>Oui</option><option value="0" ${x.allowKitchenMessage===false?'selected':''}>Non</option></select></label>
    <label>Stock<input id="pStock" type="number" value="${x.stock??0}"></label>
    <label>Seuil bas<input id="pLow" type="number" value="${x.low??5}"></label>
    <button id="${p?'saveProductEdit':'saveProduct'}" ${p?`data-id="${p.id}"`:''} class="primary span3">${p?'Enregistrer':'Créer'}</button>
  </div>`;
}
function renderStock(){qs('#stockList').innerHTML=state.products.map(p=>`<div class="admin-row"><div><b>${esc(p.name)}</b></div><div>${esc(p.cat)}</div><div><b>${p.stock}</b>${p.stock<=p.low?' ⚠️':''}</div><div><button class="stockMinus" data-id="${p.id}">−</button> <button class="stockPlus" data-id="${p.id}">+</button></div></div>`).join('')}
function renderReports(){
  const total=state.payments.reduce((s,p)=>s+p.total,0),today=localDateISO(),todayPays=state.payments.filter(p=>p.date.slice(0,10)===today),todayTotal=todayPays.reduce((s,p)=>s+p.total,0);
  qs('#reportStats').innerHTML=`<div class="stat"><span>CA total démo</span><b>${money(total)}</b></div><div class="stat"><span>CA aujourd’hui</span><b>${money(todayTotal)}</b></div><div class="stat"><span>Paiements</span><b>${state.payments.length}</b></div><div class="stat"><span>Commandes ouvertes</span><b>${Object.keys(state.openOrders).length}</b></div><div class="stat"><span>Réservations</span><b>${state.reservations.length}</b></div>`;
  const vat={6:0,12:0,21:0};state.payments.forEach(p=>[6,12,21].forEach(v=>vat[v]+=Number(p.vat?.[v]||0)));qs('#vatReport').innerHTML=`<h3>TVA</h3>${[6,12,21].map(v=>`TVA ${v}% : <b>${money(vat[v])}</b><br>`).join('')}`;
  const pm={card:0,cash:0,meal:0};state.payments.forEach(p=>pm[p.method]=(pm[p.method]||0)+p.total);qs('#paymentsReport').innerHTML=`<h3>Moyens de paiement</h3>Carte : <b>${money(pm.card)}</b><br>Espèces : <b>${money(pm.cash)}</b><br>Chèque-repas : <b>${money(pm.meal)}</b>`
}
qs('#resetDemoBtn').onclick=()=>modal('Réinitialiser la démo',`<p>Supprimer toutes les données de démonstration de ce navigateur ?</p><button id="confirmReset" class="dangerbtn">Oui, réinitialiser</button>`);

function periodBounds(period){const now=new Date(),today=localDateISO(now);if(period==='today')return{from:today,to:today};if(period==='month'){const from=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;const last=new Date(now.getFullYear(),now.getMonth()+1,0);return{from,to:localDateISO(last)}}if(period==='year')return{from:`${now.getFullYear()}-01-01`,to:`${now.getFullYear()}-12-31`};return{from:null,to:null}}
function dateInPeriod(date,period){const b=periodBounds(period);if(!b.from)return true;const d=String(date).slice(0,10);return d>=b.from&&d<=b.to}
function expenseForm(e=null){const x=e||{};return `<div class="form-grid"><label>Date<input id="eDate" type="date" value="${esc(x.date||localDateISO())}"></label><label>Catégorie<select id="eCategory">${['Achats marchandises','Loyer','Salaires','Énergie','Assurances','Entretien','Marketing','Transport','Honoraires','Autre'].map(c=>`<option ${x.category===c?'selected':''}>${c}</option>`).join('')}</select></label><label>Montant TVAC<input id="eAmount" type="number" step="0.01" value="${x.amount??0}"></label><label>TVA<select id="eVat">${[0,6,12,21].map(v=>`<option value="${v}" ${Number(x.vat||0)===v?'selected':''}>${v}%</option>`).join('')}</select></label><label>Fournisseur<select id="eSupplier"><option value="">Aucun</option>${state.suppliers.map(s=>`<option value="${s.id}" ${Number(x.supplierId)===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label><label>Paiement<select id="eMethod">${['Carte','Espèces','Virement','Domiciliation','Autre'].map(m=>`<option ${x.method===m?'selected':''}>${m}</option>`).join('')}</select></label><label class="span3">Description<input id="eDescription" value="${esc(x.description||'')}"></label><button id="${e?'saveExpenseEdit':'saveExpense'}" ${e?`data-id="${e.id}"`:''} class="primary span3">${e?'Enregistrer':'Ajouter la dépense'}</button></div>`}
function supplierForm(x=null){x=x||{};return `<div class="form-grid"><label class="span2">Nom fournisseur<input id="sSupplierName" value="${esc(x.name||'')}"></label><label>N° entreprise / TVA<input id="sSupplierVat" value="${esc(x.vatNumber||'')}"></label><label>Téléphone<input id="sSupplierPhone" value="${esc(x.phone||'')}"></label><label>E-mail<input id="sSupplierEmail" value="${esc(x.email||'')}"></label><label>Catégorie<input id="sSupplierCategory" value="${esc(x.category||'')}"></label><label class="span3">Adresse<input id="sSupplierAddress" value="${esc(x.address||'')}"></label><button id="${x.id?'saveSupplierEdit':'saveSupplier'}" ${x.id?`data-id="${x.id}"`:''} class="primary span3">${x.id?'Enregistrer':'Ajouter le fournisseur'}</button></div>`}
function renderAccounting(){const period=qs('#accountingPeriod')?.value||'month',expenses=state.expenses.filter(e=>dateInPeriod(e.date,period)),payments=state.payments.filter(p=>dateInPeriod(p.date,period)),revenue=payments.reduce((a,p)=>a+Number(p.total||0),0),expenseTotal=expenses.reduce((a,e)=>a+Number(e.amount||0),0),result=revenue-expenseTotal;qs('#accountingStats').innerHTML=`<div class="stat"><span>Chiffre d'affaires</span><b class="accounting-amount positive">${money(revenue)}</b></div><div class="stat"><span>Dépenses</span><b class="accounting-amount negative">${money(expenseTotal)}</b></div><div class="stat"><span>Résultat estimé</span><b class="accounting-amount ${result>=0?'positive':'negative'}">${money(result)}</b></div><div class="stat"><span>Ventes</span><b>${payments.length}</b></div><div class="stat"><span>Dépenses</span><b>${expenses.length}</b></div>`;qs('#expenseCount').textContent=`${expenses.length} ligne(s)`;qs('#expensesList').innerHTML=expenses.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(e=>`<div class="admin-row"><div><b>${esc(e.description||e.category)}</b><div class="muted">${esc(e.date)} · ${esc(e.category)} · ${esc(e.method)}</div></div><div>${esc(state.suppliers.find(s=>s.id===e.supplierId)?.name||'—')}</div><div><b class="accounting-amount negative">${money(e.amount)}</b><div class="muted">TVA ${e.vat}%</div></div><div><button class="editExpense" data-id="${e.id}">Modifier</button> <button class="deleteExpense" data-id="${e.id}">Supprimer</button></div></div>`).join('')||'<div class="empty">Aucune dépense</div>';qs('#supplierCount').textContent=`${state.suppliers.length} fournisseur(s)`;qs('#suppliersList').innerHTML=state.suppliers.map(x=>`<div class="admin-row"><div><b>${esc(x.name)}</b><div class="muted">${esc(x.category||'')}</div></div><div>${esc(x.vatNumber||'—')}</div><div>${esc(x.phone||x.email||'—')}</div><div><button class="editSupplier" data-id="${x.id}">Modifier</button></div></div>`).join('')||'<div class="empty">Aucun fournisseur</div>';const vs={6:0,12:0,21:0};payments.forEach(p=>[6,12,21].forEach(v=>vs[v]+=Number(p.vat?.[v]||0)));const va={6:0,12:0,21:0};expenses.forEach(e=>{const r=Number(e.vat||0),t=Number(e.amount||0);if(r)va[r]=(va[r]||0)+(t-t/(1+r/100))});qs('#accountingVat').innerHTML=`<h3>TVA estimée</h3>TVA ventes : <b>${money(vs[6]+vs[12]+vs[21])}</b><br>TVA achats : <b>${money(va[6]+va[12]+va[21])}</b><br>Solde indicatif : <b>${money(vs[6]+vs[12]+vs[21]-va[6]-va[12]-va[21])}</b><div class="muted" style="margin-top:8px">Calcul indicatif, pas une déclaration TVA.</div>`;const cats={};expenses.forEach(e=>cats[e.category]=(cats[e.category]||0)+Number(e.amount||0));qs('#accountingCategories').innerHTML=`<h3>Dépenses par catégorie</h3>${Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${esc(k)} : <b>${money(v)}</b><br>`).join('')||'Aucune donnée'}`}
function accountingCsv(){const rows=[['Date','Type','Catégorie','Description','Fournisseur','Montant TVAC','TVA','Paiement']];state.expenses.forEach(e=>rows.push([e.date,'Dépense',e.category,e.description||'',state.suppliers.find(s=>s.id===e.supplierId)?.name||'',e.amount,e.vat,e.method]));state.payments.forEach(p=>rows.push([String(p.date).slice(0,10),'Vente','Caisse','Vente caisse','',p.total,'','']));return rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n')}
function downloadText(filename,text,type='text/plain'){const blob=new Blob([text],{type:`${type};charset=utf-8`}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href)}
function invoiceLineHtml(l={}){return `<div class="invoice-line"><input class="ilDesc" placeholder="Description" value="${esc(l.description||'')}"><input class="ilQty" type="number" min="1" value="${Number(l.qty||1)}"><input class="ilPrice" type="number" min="0" step="0.01" value="${Number(l.unitPrice||0)}"><select class="ilVat">${[6,12,21].map(v=>`<option value="${v}" ${Number(l.vat||21)===v?'selected':''}>TVA ${v}%</option>`).join('')}</select><button type="button" class="removeInvoiceLine">✕</button></div>`}
function invoiceForm(inv=null){const x=inv||{},lines=x.lines?.length?x.lines:[{}];return `<div class="form-grid"><label>Date<input id="iDate" type="date" value="${esc(x.date||localDateISO())}"></label><label>Échéance<input id="iDueDate" type="date" value="${esc(x.dueDate||shiftDate(localDateISO(),30))}"></label><label>Statut<select id="iStatus">${['draft','sent','paid','cancelled'].map(v=>`<option value="${v}" ${x.status===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="span2">Client<input id="iCustomerName" value="${esc(x.customerName||'')}"></label><label>N° TVA client<input id="iCustomerVat" value="${esc(x.customerVat||'')}"></label><label class="span3">Adresse client<input id="iCustomerAddress" value="${esc(x.customerAddress||'')}"></label><div class="span3 invoice-lines"><div class="section-title"><h3>Lignes</h3><button id="addInvoiceLineBtn" type="button" class="secondary">+ Ligne</button></div><div id="invoiceLines">${lines.map(invoiceLineHtml).join('')}</div></div><label class="span3">Note<textarea id="iNote">${esc(x.note||'')}</textarea></label><button id="${inv?'saveInvoiceEdit':'saveInvoice'}" ${inv?`data-id="${inv.id}"`:''} class="primary span3">${inv?'Enregistrer la facture':'Créer la facture'}</button></div>`}
function readInvoiceForm(){const lines=qsa('#invoiceLines .invoice-line').map(r=>({description:r.querySelector('.ilDesc').value.trim(),qty:Number(r.querySelector('.ilQty').value||1),unitPrice:Number(r.querySelector('.ilPrice').value||0),vat:Number(r.querySelector('.ilVat').value||21)})).filter(l=>l.description);return{date:qs('#iDate').value,dueDate:qs('#iDueDate').value,status:qs('#iStatus').value,customerName:qs('#iCustomerName').value.trim(),customerVat:qs('#iCustomerVat').value.trim(),customerAddress:qs('#iCustomerAddress').value.trim(),note:qs('#iNote').value.trim(),lines}}
function invoiceTotals(inv){let ht=0,tva=0,ttc=0;(inv.lines||[]).forEach(l=>{const h=Number(l.qty)*Number(l.unitPrice),v=h*Number(l.vat)/100;ht+=h;tva+=v;ttc+=h+v});return{ht,tva,ttc}}
function renderInvoices(){const total=state.invoices.reduce((s,i)=>s+invoiceTotals(i).ttc,0),paid=state.invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+invoiceTotals(i).ttc,0),due=state.invoices.filter(i=>['draft','sent'].includes(i.status)).reduce((s,i)=>s+invoiceTotals(i).ttc,0);qs('#invoiceStats').innerHTML=`<div class="stat"><span>Factures</span><b>${state.invoices.length}</b></div><div class="stat"><span>Total facturé</span><b>${money(total)}</b></div><div class="stat"><span>Payé</span><b class="accounting-amount positive">${money(paid)}</b></div><div class="stat"><span>À recevoir</span><b>${money(due)}</b></div><div class="stat"><span>Brouillons</span><b>${state.invoices.filter(i=>i.status==='draft').length}</b></div>`;qs('#invoicesList').innerHTML=state.invoices.slice().sort((a,b)=>b.id-a.id).map(i=>{const t=invoiceTotals(i);return `<div class="admin-row"><div><b>FAC-${String(i.id).padStart(4,'0')}</b><div class="muted">${esc(i.date)} · ${esc(i.customerName)}</div></div><div><span class="invoice-status ${i.status}">${esc(i.status)}</span></div><div><b>${money(t.ttc)}</b><div class="muted">TVA ${money(t.tva)}</div></div><div><button class="viewInvoice" data-id="${i.id}">Voir</button> <button class="editInvoice" data-id="${i.id}">Modifier</button></div></div>`}).join('')||'<div class="empty">Aucune facture</div>'}
function invoicePreview(i){const t=invoiceTotals(i);return `<div class="invoice-preview"><div style="display:flex;justify-content:space-between"><div><h2>${esc(state.settings.establishmentName)}</h2><div class="muted">Facture de démonstration</div></div><div><h3>FAC-${String(i.id).padStart(4,'0')}</h3><div>${esc(i.date)}</div></div></div><hr><b>Client</b><br>${esc(i.customerName)}<br>${esc(i.customerAddress||'')}${i.customerVat?`<br>TVA : ${esc(i.customerVat)}`:''}<table class="invoice-preview-table"><thead><tr><th>Description</th><th>Qté</th><th>PU HT</th><th>TVA</th><th>TTC</th></tr></thead><tbody>${i.lines.map(l=>`<tr><td>${esc(l.description)}</td><td>${l.qty}</td><td>${money(l.unitPrice)}</td><td>${l.vat}%</td><td>${money(l.qty*l.unitPrice*(1+l.vat/100))}</td></tr>`).join('')}</tbody></table><div class="invoice-preview-total"><div>HT : <b>${money(t.ht)}</b></div><div>TVA : <b>${money(t.tva)}</b></div><div style="font-size:20px">TTC : <b>${money(t.ttc)}</b></div></div><div class="muted" style="margin-top:16px">Document de démonstration — non Peppol / non SCE</div></div>`}
qs('#newExpenseBtn').onclick=()=>modal('Nouvelle dépense',expenseForm());qs('#newSupplierBtn').onclick=()=>modal('Nouveau fournisseur',supplierForm());qs('#exportAccountingCsvBtn').onclick=()=>downloadText(`restaurant-pro-comptabilite-${localDateISO()}.csv`,accountingCsv(),'text/csv');qs('#accountingPeriod').onchange=renderAccounting;qs('#newInvoiceBtn').onclick=()=>modal('Nouvelle facture',invoiceForm());

function tableSettingsForm(t=null){
  const x=t||{};
  const number=x.number??'';
  const rotation=[0,90,180,270].includes(Number(x.rotation))?Number(x.rotation):0;
  const shape=['rectangle','rounded','round'].includes(x.shape)?x.shape:'rounded';
  return `<div class="form-grid">
    <label>Numéro de table<input id="tableSettingNumber" type="number" min="1" step="1" value="${esc(number)}" placeholder="Ex. 12"></label>
    <label>Nombre de places<input id="tableSettingSeats" type="number" min="1" step="1" value="${Number(x.seats||2)}"></label>
    <label>Salle<select id="tableSettingRoom">${state.rooms.map(r=>`<option value="${r.id}" ${Number(x.roomId||state.settingsRoomId)===Number(r.id)?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label>
    <label>Largeur (px)<input id="tableSettingWidth" type="number" min="56" max="220" step="4" value="${Math.max(56,Math.min(220,Number(x.width||100)))}"></label>
    <label>Hauteur (px)<input id="tableSettingHeight" type="number" min="42" max="160" step="4" value="${Math.max(42,Math.min(160,Number(x.height||72)))}"></label>
    <label>Orientation<select id="tableSettingRotation">${[0,90,180,270].map(v=>`<option value="${v}" ${rotation===v?'selected':''}>${v}°</option>`).join('')}</select></label>
    <label>Forme<select id="tableSettingShape"><option value="rectangle" ${shape==='rectangle'?'selected':''}>Rectangle</option><option value="rounded" ${shape==='rounded'?'selected':''}>Coins arrondis</option><option value="round" ${shape==='round'?'selected':''}>Ronde / ovale</option></select></label>
    <label class="span2">Nom / libellé<input id="tableSettingName" value="${esc(x.name||'')}" placeholder="Laisser vide pour Table + numéro"></label>
    <div class="span3 muted">Astuce : utilisez ↻ Tourner dans la liste pour pivoter rapidement de 90°.</div>
    <button id="${t?'saveTableEdit':'saveTableCreate'}" ${t?`data-id="${t.id}"`:''} class="primary span3">${t?'Enregistrer la table':'Créer la table'}</button>
  </div>`;
}
function renderRoomSettings(){
  const select=qs('#settingsRoomSelect'),stage=qs('#settingsFloorPlan'),list=qs('#settingsTablesList');
  if(!select||!stage||!list)return;
  if(!roomById(state.settingsRoomId))state.settingsRoomId=state.rooms[0]?.id||null;
  select.innerHTML=state.rooms.map(r=>`<option value="${r.id}" ${Number(r.id)===Number(state.settingsRoomId)?'selected':''}>${esc(r.name)}</option>`).join('');
  const room=roomById(state.settingsRoomId);
  const tables=room?state.tables.filter(t=>Number(t.roomId)===Number(room.id)):[];
  stage.innerHTML=tables.map(t=>floorPlanTableHtml(t,true)).join('')||'<div class="floor-plan-empty">Aucune table. Cliquez sur « + Ajouter une table ».</div>';
  list.innerHTML=tables.map(t=>`<div class="room-table-row"><div><b>Table ${esc(t.number)}</b> · ${esc(t.name)}<div class="muted">${t.seats} places · ${esc(room?.name||'')} · ${Math.round(Number(t.width||100))}×${Math.round(Number(t.height||72))} px · ${Number(t.rotation||0)}°</div></div><div><button class="secondary rotateTableSetting" data-id="${t.id}">↻ Tourner 90°</button> <button class="secondary editTableSetting" data-id="${t.id}">Modifier</button> <button class="dangerbtn deleteTableSetting" data-id="${t.id}">Supprimer</button></div></div>`).join('')||'<div class="empty">Aucune table dans cette salle</div>';
  qs('#roomCountLabel').textContent=`${state.rooms.length} salle(s) · ${state.tables.length} table(s)`;
  bindSettingsTableDrag();
}
function bindSettingsTableDrag(){
  const stage=qs('#settingsFloorPlan');if(!stage)return;
  stage.querySelectorAll('.settings-table-node').forEach(node=>{
    node.onpointerdown=e=>{
      if(e.button!==undefined&&e.button!==0)return;
      e.preventDefault();
      const id=Number(node.dataset.settingsTableId),t=state.tables.find(v=>Number(v.id)===id);if(!t)return;
      const rect=stage.getBoundingClientRect(),nodeRect=node.getBoundingClientRect();
      const offsetX=e.clientX-nodeRect.left,offsetY=e.clientY-nodeRect.top;
      node.setPointerCapture?.(e.pointerId);node.classList.add('dragging');
      const move=ev=>{
        const widthPct=(node.offsetWidth/rect.width)*100,heightPct=(node.offsetHeight/rect.height)*100;
        const x=((ev.clientX-rect.left-offsetX)/rect.width)*100;
        const y=((ev.clientY-rect.top-offsetY)/rect.height)*100;
        t.x=Math.max(0,Math.min(Math.max(0,100-widthPct),x));
        t.y=Math.max(0,Math.min(Math.max(0,100-heightPct),y));
        node.style.left=t.x+'%';node.style.top=t.y+'%';
      };
      const up=()=>{node.classList.remove('dragging');document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);save()};
      document.addEventListener('pointermove',move);document.addEventListener('pointerup',up,{once:true});
    };
  });
}
function renderSettings(){
  qs('#generalEstablishmentName').value=state.settings.establishmentName;
  renderRoomSettings();
}
qs('#saveGeneralSettingsBtn').onclick=()=>{state.settings.establishmentName=qs('#generalEstablishmentName').value.trim()||'Restaurant Pro';save();toast('Paramètres enregistrés')};
qs('#settingsRoomSelect').onchange=e=>{state.settingsRoomId=Number(e.target.value);save();renderRoomSettings()};
qs('#addRoomBtn').onclick=()=>modal('Ajouter une salle',`<div class="form-grid"><label class="span3">Nom de la salle<input id="newRoomName" placeholder="Ex. Terrasse, Étage, Salon..."></label><button id="saveRoomCreate" class="primary span3">Créer la salle</button></div>`);
qs('#renameRoomBtn').onclick=()=>{const r=roomById(state.settingsRoomId);if(r)modal('Renommer la salle',`<div class="form-grid"><label class="span3">Nom<input id="renameRoomName" value="${esc(r.name)}"></label><button id="saveRoomRename" data-id="${r.id}" class="primary span3">Enregistrer</button></div>`)};
qs('#deleteRoomBtn').onclick=()=>{const r=roomById(state.settingsRoomId);if(!r)return;if(state.rooms.length<=1)return toast('Il faut conserver au moins une salle');if(state.tables.some(t=>Number(t.roomId)===Number(r.id)))return toast('Déplacez ou supprimez d’abord les tables de cette salle');if(confirm(`Supprimer la salle « ${r.name} » ?`)){state.rooms=state.rooms.filter(x=>Number(x.id)!==Number(r.id));state.settingsRoomId=state.rooms[0].id;state.posRoomId=state.rooms[0].id;save();renderRoomSettings();toast('Salle supprimée')}};
qs('#addTableBtn').onclick=()=>modal('Ajouter une table',tableSettingsForm());

document.addEventListener('click',e=>{
  if(e.target.id==='modalClose')closeModal();

  // ===== v2.22 : sélection rapide + plan de salle =====
  if(e.target.matches('[data-table-digit]')){const input=qs('#quickTableNumber');if(input&&input.value.length<4)input.value+=e.target.dataset.tableDigit}
  if(e.target.id==='quickTableBackspace'){const input=qs('#quickTableNumber');if(input)input.value=input.value.slice(0,-1)}
  if(e.target.id==='quickTableClear'){const input=qs('#quickTableNumber');if(input)input.value=''}
  if(e.target.id==='openTableByNumber')openTableByNumber();
  if(e.target.id==='openFloorPlanBtn')openFloorPlan();
  if(e.target.matches('[data-plan-room-id]'))openFloorPlan(Number(e.target.dataset.planRoomId));
  const planTable=e.target.closest?.('[data-select-table-id]');
  if(planTable){const t=state.tables.find(v=>Number(v.id)===Number(planTable.dataset.selectTableId));if(t){closeModal();selectTable(t)}}

  // ===== v2.22 : gestion salles / tables / dimensions / rotation =====
  if(e.target.id==='saveRoomCreate'){
    const name=qs('#newRoomName')?.value.trim();if(!name)return toast('Nom de salle requis');
    const r={id:state.nextRoomId++,name};state.rooms.push(r);state.settingsRoomId=r.id;state.posRoomId=r.id;save();closeModal();renderRoomSettings();toast('Salle créée');
  }
  if(e.target.id==='saveRoomRename'){
    const r=roomById(Number(e.target.dataset.id)),name=qs('#renameRoomName')?.value.trim();if(!r||!name)return toast('Nom requis');r.name=name;save();closeModal();renderRoomSettings();renderContext();toast('Salle renommée');
  }
  if(e.target.id==='saveTableCreate'||e.target.id==='saveTableEdit'){
    const number=Number(qs('#tableSettingNumber')?.value),seats=Number(qs('#tableSettingSeats')?.value),roomId=Number(qs('#tableSettingRoom')?.value),editing=e.target.id==='saveTableEdit',id=Number(e.target.dataset.id||0);
    const width=Math.max(56,Math.min(220,Number(qs('#tableSettingWidth')?.value||100)));
    const height=Math.max(42,Math.min(160,Number(qs('#tableSettingHeight')?.value||72)));
    const rotation=Number(qs('#tableSettingRotation')?.value||0);
    const shape=qs('#tableSettingShape')?.value||'rounded';
    if(!Number.isInteger(number)||number<1)return toast('Numéro de table invalide');
    if(!Number.isInteger(seats)||seats<1)return toast('Nombre de places invalide');
    if(![0,90,180,270].includes(rotation))return toast('Orientation invalide');
    if(!['rectangle','rounded','round'].includes(shape))return toast('Forme invalide');
    if(state.tables.some(t=>Number(t.number)===number&&(!editing||Number(t.id)!==id)))return toast(`Le numéro ${number} existe déjà`);
    const name=qs('#tableSettingName')?.value.trim()||`Table ${number}`;
    if(editing){const t=state.tables.find(v=>Number(v.id)===id);if(!t)return;t.number=number;t.seats=seats;t.roomId=roomId;t.name=name;t.width=width;t.height=height;t.rotation=rotation;t.shape=shape;}
    else{const sameRoomCount=state.tables.filter(t=>Number(t.roomId)===roomId).length;state.tables.push({id:state.nextTableId++,number,name,seats,roomId,x:8+((sameRoomCount%4)*22),y:10+(Math.floor(sameRoomCount/4)*28),width,height,rotation,shape});}
    state.settingsRoomId=roomId;save();closeModal();renderRoomSettings();renderTables();toast(editing?'Table modifiée':'Table créée');
  }
  if(e.target.classList.contains('rotateTableSetting')){const t=state.tables.find(v=>Number(v.id)===Number(e.target.dataset.id));if(t){t.rotation=(Number(t.rotation||0)+90)%360;save();renderRoomSettings();toast(`Table ${t.number} tournée à ${t.rotation}°`)}}
  if(e.target.classList.contains('editTableSetting')){const t=state.tables.find(v=>Number(v.id)===Number(e.target.dataset.id));if(t)modal('Modifier la table',tableSettingsForm(t))}
  if(e.target.classList.contains('deleteTableSetting')){
    const id=Number(e.target.dataset.id),t=state.tables.find(v=>Number(v.id)===id);if(!t)return;
    if(state.openOrders[id])return toast('Impossible : cette table a une commande ouverte');
    if(state.reservations.some(r=>Number(r.tableId)===id&&!['cancelled','finished','no_show'].includes(r.status)))return toast('Impossible : réservation active sur cette table');
    if(confirm(`Supprimer ${t.name} ?`)){state.tables=state.tables.filter(v=>Number(v.id)!==id);if(Number(state.tableId)===id){state.tableId=null;state.cart=[];state.sent=false;state.dirty=false}save();renderRoomSettings();renderTables();renderContext();renderCart();toast('Table supprimée')}
  }
  if(e.target.id==='confirmOpenCash'){state.cashOpen=true;state.cashOpening=Number(qs('#cashOpenAmount').value||0);save();renderCash();closeModal();toast('Caisse ouverte')}
  if(e.target.id==='confirmCloseCash'){state.cashOpen=false;save();renderCash();closeModal();toast('Caisse fermée')}
  if(e.target.classList.contains('newAtSlot'))modal('Nouvelle réservation',reservationForm(null,e.target.dataset.time));
  if(e.target.id==='saveRes'){
    const x=readResForm(),err=validateReservation(x);if(err)return toast(err);x.id=state.nextReservationId++;state.reservations.push(x);state.reservationDate=x.date;save();closeModal();renderReservations();renderTables();toast('Réservation créée')
  }
  if(e.target.classList.contains('resEdit')){const r=state.reservations.find(x=>x.id===Number(e.target.dataset.id));if(r)modal('Modifier réservation',reservationForm(r))}
  if(e.target.id==='saveResEdit'){const id=Number(e.target.dataset.id),r=state.reservations.find(x=>x.id===id);const x=readResForm(r?.status||'booked'),err=validateReservation(x,id);if(err)return toast(err);Object.assign(r,x);state.reservationDate=x.date;save();closeModal();renderReservations();renderTables();toast('Réservation modifiée')}
  if(e.target.classList.contains('resCancel')){const r=state.reservations.find(x=>x.id===Number(e.target.dataset.id));if(r){r.status='cancelled';save();renderReservations();renderTables();toast('Réservation annulée')}}
  if(e.target.classList.contains('resArrive')){const r=state.reservations.find(x=>x.id===Number(e.target.dataset.id));if(r){r.status='arrived';save();renderReservations();renderTables();if(r.tableId){setPage('pos');selectTable(state.tables.find(t=>t.id===r.tableId));toast('Table ouverte pour le client')}else toast('Client arrivé — attribuez une table')}}
  if(e.target.id==='saveResSettings'){Object.assign(state.settings,{establishmentName:qs('#sName').value.trim()||'Restaurant Pro',maxReservationsPerDay:Number(qs('#sMaxRes').value),maxCoversPerDay:Number(qs('#sMaxCovers').value),maxPartySize:Number(qs('#sMaxParty').value),minLeadMinutes:Number(qs('#sLead').value),maxAdvanceDays:Number(qs('#sAdvance').value),slotIntervalMinutes:Number(qs('#sSlot').value),defaultDurationMinutes:Number(qs('#sDuration').value),lunchEnabled:qs('#sLunchOn').value==='1',lunchStart:qs('#sLunchStart').value,lunchEnd:qs('#sLunchEnd').value,dinnerEnabled:qs('#sDinnerOn').value==='1',dinnerStart:qs('#sDinnerStart').value,dinnerEnd:qs('#sDinnerEnd').value,phoneRequired:qs('#sPhone').value==='1',allowUnassignedTable:qs('#sUnassigned').value==='1',staffCanOverrideLimits:qs('#sOverride').value==='1'});save();closeModal();renderReservations();toast('Paramètres enregistrés')}
  if(e.target.id==='saveProduct'){const p={id:state.nextProductId++,name:qs('#pName').value.trim(),cat:qs('#pCat').value,price:Number(qs('#pPrice').value),vat:Number(qs('#pVat').value),station:qs('#pStation').value,askCooking:qs('#pAskCooking')?.value==='1',askSauce:qs('#pAskSauce')?.value==='1',accompanimentGroupId:qs('#pAccompanimentGroup')?.value?Number(qs('#pAccompanimentGroup').value):null,allowKitchenMessage:qs('#pAllowKitchenMessage')?.value!=='0',stock:Number(qs('#pStock').value),low:Number(qs('#pLow').value)};state.products.push(p);save();closeModal();renderProductsAdmin();renderCategories();renderProducts();toast('Produit créé')}
  if(e.target.classList.contains('editProduct')){const p=state.products.find(x=>x.id===Number(e.target.dataset.id));if(p)modal('Modifier produit',productForm(p))}
  if(e.target.id==='saveProductEdit'){const p=state.products.find(x=>x.id===Number(e.target.dataset.id));Object.assign(p,{name:qs('#pName').value.trim(),cat:qs('#pCat').value,price:Number(qs('#pPrice').value),vat:Number(qs('#pVat').value),station:qs('#pStation').value,askCooking:qs('#pAskCooking')?.value==='1',askSauce:qs('#pAskSauce')?.value==='1',accompanimentGroupId:qs('#pAccompanimentGroup')?.value?Number(qs('#pAccompanimentGroup').value):null,allowKitchenMessage:qs('#pAllowKitchenMessage')?.value!=='0',stock:Number(qs('#pStock').value),low:Number(qs('#pLow').value)});save();closeModal();renderProductsAdmin();renderCategories();renderProducts();toast('Produit modifié')}
  if(e.target.classList.contains('stockMinus')){const p=state.products.find(x=>x.id===Number(e.target.dataset.id));p.stock=Math.max(0,p.stock-1);save();renderStock();renderProducts()}
  if(e.target.classList.contains('stockPlus')){const p=state.products.find(x=>x.id===Number(e.target.dataset.id));p.stock++;save();renderStock();renderProducts()}

  if(e.target.id==='saveExpense'){state.expenses.push({id:state.nextExpenseId++,date:qs('#eDate').value,category:qs('#eCategory').value,amount:Number(qs('#eAmount').value||0),vat:Number(qs('#eVat').value||0),supplierId:qs('#eSupplier').value?Number(qs('#eSupplier').value):null,method:qs('#eMethod').value,description:qs('#eDescription').value.trim()});save();closeModal();renderAccounting();toast('Dépense ajoutée')}
  if(e.target.classList.contains('editExpense')){const x=state.expenses.find(v=>v.id===Number(e.target.dataset.id));if(x)modal('Modifier dépense',expenseForm(x))}
  if(e.target.id==='saveExpenseEdit'){const x=state.expenses.find(v=>v.id===Number(e.target.dataset.id));if(x)Object.assign(x,{date:qs('#eDate').value,category:qs('#eCategory').value,amount:Number(qs('#eAmount').value||0),vat:Number(qs('#eVat').value||0),supplierId:qs('#eSupplier').value?Number(qs('#eSupplier').value):null,method:qs('#eMethod').value,description:qs('#eDescription').value.trim()});save();closeModal();renderAccounting();toast('Dépense modifiée')}
  if(e.target.classList.contains('deleteExpense')){state.expenses=state.expenses.filter(v=>v.id!==Number(e.target.dataset.id));save();renderAccounting();toast('Dépense supprimée')}
  if(e.target.id==='saveSupplier'){state.suppliers.push({id:state.nextSupplierId++,name:qs('#sSupplierName').value.trim(),vatNumber:qs('#sSupplierVat').value.trim(),phone:qs('#sSupplierPhone').value.trim(),email:qs('#sSupplierEmail').value.trim(),category:qs('#sSupplierCategory').value.trim(),address:qs('#sSupplierAddress').value.trim()});save();closeModal();renderAccounting();toast('Fournisseur ajouté')}
  if(e.target.classList.contains('editSupplier')){const x=state.suppliers.find(v=>v.id===Number(e.target.dataset.id));if(x)modal('Modifier fournisseur',supplierForm(x))}
  if(e.target.id==='saveSupplierEdit'){const x=state.suppliers.find(v=>v.id===Number(e.target.dataset.id));if(x)Object.assign(x,{name:qs('#sSupplierName').value.trim(),vatNumber:qs('#sSupplierVat').value.trim(),phone:qs('#sSupplierPhone').value.trim(),email:qs('#sSupplierEmail').value.trim(),category:qs('#sSupplierCategory').value.trim(),address:qs('#sSupplierAddress').value.trim()});save();closeModal();renderAccounting();toast('Fournisseur modifié')}
  if(e.target.id==='addInvoiceLineBtn')qs('#invoiceLines').insertAdjacentHTML('beforeend',invoiceLineHtml({}));
  if(e.target.classList.contains('removeInvoiceLine'))e.target.closest('.invoice-line')?.remove();
  if(e.target.id==='saveInvoice'){const x=readInvoiceForm();if(!x.customerName)return toast('Nom du client requis');if(!x.lines.length)return toast('Ajoutez une ligne');x.id=state.nextInvoiceId++;state.invoices.push(x);save();closeModal();renderInvoices();toast('Facture créée')}
  if(e.target.classList.contains('editInvoice')){const x=state.invoices.find(v=>v.id===Number(e.target.dataset.id));if(x)modal('Modifier facture',invoiceForm(x))}
  if(e.target.id==='saveInvoiceEdit'){const x=state.invoices.find(v=>v.id===Number(e.target.dataset.id)),v=readInvoiceForm();if(!v.customerName)return toast('Nom du client requis');if(!v.lines.length)return toast('Ajoutez une ligne');Object.assign(x,v);save();closeModal();renderInvoices();toast('Facture modifiée')}
  if(e.target.classList.contains('viewInvoice')){const x=state.invoices.find(v=>v.id===Number(e.target.dataset.id));if(x)modal(`Facture FAC-${String(x.id).padStart(4,'0')}`,invoicePreview(x))}

  if(e.target.id==='saveCustomKitchenNote'){const idx=Number(e.target.dataset.cartIndex),item=state.cart[idx];if(item){item.kitchenNote=qs('#customKitchenNote').value.trim();state.cart=consolidateCart(state.cart);save();closeModal();renderCart();toast('Message cuisine enregistré')}}
  if(e.target.id==='saveAccompanimentGroup'){const name=qs('#agName').value.trim(),items=qs('#agItems').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!name)return toast('Nom requis');state.accompanimentGroups.push({id:state.nextAccompanimentGroupId++,name,items});save();closeModal();renderKitchenOptions();toast('Famille créée')}
  if(e.target.classList.contains('editAccompanimentGroup')){const g=state.accompanimentGroups.find(x=>Number(x.id)===Number(e.target.dataset.id));if(g)modal('Modifier famille',accompanimentGroupForm(g))}
  if(e.target.id==='saveAccompanimentGroupEdit'){const g=state.accompanimentGroups.find(x=>Number(x.id)===Number(e.target.dataset.id));if(g){g.name=qs('#agName').value.trim();g.items=qs('#agItems').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);save();closeModal();renderKitchenOptions();toast('Famille modifiée')}}
  if(e.target.classList.contains('deleteAccompanimentGroup')){const id=Number(e.target.dataset.id);state.accompanimentGroups=state.accompanimentGroups.filter(x=>Number(x.id)!==id);state.products.forEach(p=>{if(Number(p.accompanimentGroupId)===id)p.accompanimentGroupId=null});save();renderKitchenOptions();renderProductsAdmin();toast('Famille supprimée')}
  if(e.target.id==='saveKitchenMessage'){const m=qs('#kmText').value.trim();if(!m)return toast('Message requis');state.kitchenMessages.push(m);save();closeModal();renderKitchenOptions();toast('Message ajouté')}
  if(e.target.classList.contains('editKitchenMessage')){const idx=Number(e.target.dataset.index);modal('Modifier message',kitchenMessageForm(state.kitchenMessages[idx],idx))}
  if(e.target.id==='saveKitchenMessageEdit'){const idx=Number(e.target.dataset.index),m=qs('#kmText').value.trim();if(m)state.kitchenMessages[idx]=m;save();closeModal();renderKitchenOptions();toast('Message modifié')}
  if(e.target.classList.contains('deleteKitchenMessage')){state.kitchenMessages.splice(Number(e.target.dataset.index),1);save();renderKitchenOptions();toast('Message supprimé')}
  if(e.target.classList.contains('config-cooking')){
    qsa('.config-cooking').forEach(b=>b.classList.remove('active'));e.target.classList.add('active');if(pendingProductConfig)pendingProductConfig.cooking=e.target.dataset.value;
  }
  if(e.target.classList.contains('config-sauce')){
    qsa('.config-sauce').forEach(b=>b.classList.remove('active'));e.target.classList.add('active');if(pendingProductConfig)pendingProductConfig.sauce=e.target.dataset.value;
  }
  if(e.target.classList.contains('config-accompaniment')){
    qsa('.config-accompaniment').forEach(b=>b.classList.remove('active'));e.target.classList.add('active');if(pendingProductConfig)pendingProductConfig.accompaniment=e.target.dataset.value;
  }
  if(e.target.classList.contains('config-message')){
    const wasActive=e.target.classList.contains('active');qsa('.config-message').forEach(b=>b.classList.remove('active'));
    if(pendingProductConfig)pendingProductConfig.kitchenNote=wasActive?'':e.target.dataset.value;
    if(!wasActive)e.target.classList.add('active');
    const custom=qs('#configCustomMessage');if(custom)custom.value='';
  }
  if(e.target.id==='cancelProductConfig'){pendingProductConfig=null;closeModal()}
  if(e.target.id==='confirmProductConfig'){
    if(!pendingProductConfig)return;
    const p=state.products.find(x=>Number(x.id)===Number(pendingProductConfig.productId));if(!p)return;
    const group=getAccompanimentGroup(p.accompanimentGroupId);
    const custom=qs('#configCustomMessage')?.value.trim();if(custom)pendingProductConfig.kitchenNote=custom;
    if(p.askCooking&&!pendingProductConfig.cooking)return toast('Choisissez la cuisson');
    if(p.askSauce&&!pendingProductConfig.sauce)return toast('Choisissez la sauce');
    if(group&&!pendingProductConfig.accompaniment)return toast('Choisissez l’accompagnement');
    addConfiguredProduct(p,pendingProductConfig);pendingProductConfig=null;closeModal();toast('Article ajouté');
  }
  if(e.target.id==='confirmReset'){localStorage.removeItem(STORAGE);location.reload()}
});
qs('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};

function renderAll(){renderCash();renderTables();renderContext();renderCategories();renderProducts();renderCart();renderReservations()}
load();
state.cart=consolidateCart(state.cart||[]);
Object.keys(state.openOrders||{}).forEach(k=>{
  if(state.openOrders[k]?.items)state.openOrders[k].items=consolidateCart(state.openOrders[k].items);
});
save();
if(!state.reservationDate)state.reservationDate=localDateISO();
if(state.user)showApp();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
