import fs from 'node:fs/promises';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const ROOT='D:/echo-work/flair-perfumes';
const TMP=ROOT+'/tmp/presentation-flair';
const OUT=ROOT+'/output/presentations/Flair_ERP_Client_Vision_and_Demo.pptx';
const C={ivory:'#F7F5EE',ink:'#103D43',dark:'#082C34',teal:'#23716D',gold:'#B28B4E',pale:'#E5EEEA',muted:'#597071',white:'#FFFFFF',line:'#C5D1CC',softGold:'#EEE4D2'};
const p=Presentation.create({slideSize:{width:1600,height:900}});
let seq=0; const records=[];
function box(s,x,y,w,h,fill,stroke='none',name='surface'){
 return s.shapes.add({name:name+'-'+seq++,geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:stroke==='none'?0:1.5,style:'solid'}});
}
function text(s,t,x,y,w,h,size=28,color=C.ink,bold=false,align='left',font='Aptos'){
 const z=box(s,x,y,w,h,'none','none','text');z.text=t;z.text.style={fontSize:size,typeface:font,color,bold,alignment:align,verticalAlignment:'top',autoFit:'none',wrap:'square',insets:{left:0,right:0,top:0,bottom:0}};return z;
}
function rule(s,x,y,w,color=C.line){box(s,x,y,w,2,color,'none','rule');}
function line(s,x1,y1,x2,y2,color=C.gold,dashed=false){
 const sh=s.shapes.add({name:'edge-'+seq++,geometry:'line',position:{left:Math.min(x1,x2),top:Math.min(y1,y2),width:Math.max(1,Math.abs(x2-x1)),height:Math.max(1,Math.abs(y2-y1)),horizontalFlip:x2<x1,verticalFlip:y2<y1},fill:'none',line:{fill:color,width:2,style:dashed?'dashed':'solid'}});return sh;
}
function notes(s,body,source='README.md; ERP_Modules.pdf'){
 s.speakerNotes.textFrame.setText(body+'\n\n[Sources]\n'+source.split('; ').map(v=>ROOT+'/'+v).join('\n')+'\n[/Sources]');
}
function slide(title,kicker='FLAIR ERP / THE CONNECTED BUSINESS',dark=false,sub=''){
 const s=p.slides.add();s.background.fill=dark?C.dark:C.ivory;
 text(s,kicker,72,42,1410,30,22,dark?C.gold:C.teal,true);
 text(s,title,72,91,1456,80,52,dark?C.ivory:C.ink,true);
 if(sub)text(s,sub,72,175,1456,68,28,dark?'#CBDAD6':C.muted);
 rule(s,72,826,1456,dark?'#335158':C.line);
 text(s,'FLAIR COSMETIC & FRAGRANCE',72,843,760,30,20,dark?'#AFC4C1':C.muted,true);
 text(s,String(p.slides.items.length).padStart(2,'0'),1440,837,88,36,26,dark?C.gold:C.teal,true,'right');
 records.push({slide:p.slides.items.length,title,kind:kicker});return s;
}
async function img(s,file,x,y,w,h,fit='contain'){
 const b=await fs.readFile(file);s.images.add({name:'image-'+seq++,blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:file.endsWith('.webp')?'image/webp':'image/png',alt:file.split('/').pop(),fit,position:{left:x,top:y,width:w,height:h}});
}
function node(s,title,body,x,y,w=360,h=122,{dark=false,gold=false}={}){
 box(s,x,y,w,h,dark?C.teal:(gold?C.softGold:C.pale));text(s,title,x+22,y+18,w-44,44,32,dark?C.ivory:C.ink,true);
 if(body)text(s,body,x+22,y+65,w-44,h-70,25,dark?'#E4EEEA':C.muted);return {x,y,w,h};
}
function flow(s,items,y=340,{x=72,w=1456,h=164,gap=26}={}){
 const nw=(w-gap*(items.length-1))/items.length;
 for(let i=0;i<items.length-1;i++){line(s,x+i*(nw+gap)+nw,y+h/2,x+(i+1)*(nw+gap),y+h/2,C.gold);text(s,'›',x+i*(nw+gap)+nw+5,y+h/2-22,gap-4,42,36,C.gold,true,'center');}
 items.forEach((it,i)=>node(s,it[0],it[1],x+i*(nw+gap),y,nw,h,{dark:i===0}));
}
function columns(s,items,y=295){
 const w=424,g=68;items.forEach((it,i)=>{const x=72+i*(w+g);rule(s,x,y,w,C.gold);text(s,it[0],x,y+24,w,84,36,C.ink,true);text(s,it[1],x,y+129,w,Math.max(80,Math.min(270,790-y-129)),29,C.muted);});
}
function callout(s,t,y=720,dark=false){rule(s,72,y-17,60,C.gold);text(s,t,72,y,1456,74,30,dark?C.ivory:C.ink,true);}
function map(s,center,branches,opts={}){
 const cx=622,cy=394,cw=356,ch=134;
 const positions=branches.length===4?[[72,268],[72,596],[1110,268],[1110,596]]:[[72,242],[72,448],[72,654],[1110,242],[1110,448],[1110,654]];
 positions.forEach(([x,y])=>{const left=x<600,rail=left?554:1046;line(s,left?cx:cx+cw,cy+ch/2,rail,cy+ch/2,C.gold);line(s,rail,cy+ch/2,rail,y+50,C.gold);line(s,rail,y+50,left?x+418:x,y+50,C.gold);});
 box(s,cx,cy,cw,ch,C.ink);text(s,center,cx+20,cy+30,cw-40,ch-40,37,C.ivory,true,'center');
 branches.forEach((b,i)=>{const [x,y]=positions[i];text(s,b[0],x,y,418,48,32,opts.dark?C.ivory:C.ink,true);text(s,b[1],x,y+53,418,84,25,opts.dark?'#C8D9D4':C.muted);});
}

// 01 / A deliberately quiet, premium opening.
{
const s=p.slides.add();s.background.fill=C.ivory;
await img(s,ROOT+'/public/demo/locations/harwin-store.webp',980,0,620,900,'cover');
await img(s,ROOT+'/public/brand/flair-logo.png',72,48,340,177);
text(s,'A CONNECTED FUTURE FOR FLAIR',72,305,850,40,25,C.teal,true);
text(s,'One business.\nOne connected ERP.',72,374,900,190,76,C.ink,true);
text(s,'Retail • Wholesale • E-commerce',72,623,850,44,34,C.muted);
rule(s,72,736,830,C.gold);
text(s,'Platform vision & live demonstration',72,761,830,43,28,C.ink);
text(s,'September 2026',72,820,830,30,22,C.muted);
records.push({slide:1,title:'One business. One connected ERP.'});
notes(s,'OPENING — 30 seconds. Say: “Today we will follow one product through your business: who can access it, where it is stocked, how it is sold, and how the day closes. Then we will show how purchasing, wholesale, online channels, forecasting and finance connect to the same foundation.”\nThe source proposal is a future-state scope. The current implementation is a local demo. Do not imply that all nine modules are live.','ERP_Modules.pdf; public/brand/flair-logo.png; public/demo/locations/harwin-store.webp');
}
// 02
{
const s=slide('The outcome: clearer control at every step');
map(s,'YOUR BUSINESS\nIN ONE VIEW',[
['Know your stock','Location visibility\nTraceable movements'],['Buy with confidence','Demand-led replenishment\nVendor accountability'],['Serve every channel','Retail, reseller and online orders\nConsistent product information'],['Understand performance','Cash, contribution and stock trends\nDecisions from shared records']]);
notes(s,'DISCOVERY — Ask: “Which costs you more time today: finding stock, buying the right quantities, managing channels, or closing the books?” Use the answer to emphasize the relevant branch. These are intended benefits of the completed ERP, not measured results or guarantees. Transition: “Nine connected modules support those outcomes.”');
}
// 03
{
const s=slide('Nine modules. One operating model.','THE COMPLETE ERP / SCOPE MAP',false,'A phased platform designed around perfume and cosmetics operations.');
line(s,800,352,800,376);line(s,318,376,1282,376);line(s,318,376,318,402);line(s,800,376,800,402);line(s,1282,376,1282,402);
node(s,'FLAIR ERP','Shared business records',600,239,400,113,{dark:true});
const groups=[['01–04  Operate',['01  Core Setup','02  Product & Inventory','03  Retail POS','04  Purchasing & Vendors']],['05–07  Expand',['05  Wholesale & B2B Portal','06  E-Commerce Hub','07  Reports & Dashboards']],['08–09  Optimize',['08  Smart Demand Forecasting','09  Accounting & Finance']]];
groups.forEach((g,i)=>{const x=72+i*492;rule(s,x,403,424,C.gold);text(s,g[0],x,427,424,51,36,C.ink,true);g[1].forEach((v,j)=>text(s,v,x,506+j*55,438,48,27,C.muted));});
notes(s,'Explain the three business layers. Core Setup and Product & Inventory provide the foundation. POS, purchasing, wholesale and online operations feed reporting and finance. Forecasting depends on reliable inventory and sales-channel history. Do not call the current sidebar a completed nine-module system.','ERP_Modules.pdf (pages 4–6, 21); types/core-setup.ts');
}
// 04
{
const s=slide('What you can see today—and what comes next','DEMO STATUS / SCOPE CLARITY');
text(s,'TODAY’S DEMONSTRATION',72,243,660,42,29,C.teal,true);text(s,'COMPLETED ERP VISION',850,243,678,42,29,C.gold,true);
rule(s,72,304,660);rule(s,850,304,678);
text(s,'Core Setup & sign-in',72,337,660,55,36,C.ink,true);text(s,'Location, staff and policy demos; real login roles.',72,399,660,88,28,C.muted);
text(s,'Inventory + Retail POS',72,518,660,55,36,C.ink,true);text(s,'Catalog, stock operations, sales, returns,\ncustomer credit and shift reconciliation.',72,580,660,108,28,C.muted);
text(s,'Modules 04–09',850,337,678,55,36,C.ink,true);text(s,'Purchasing, B2B, online channels, reports,\nforecasting and finance remain planned.',850,399,678,110,28,C.muted);
text(s,'Production rollout',850,551,678,55,36,C.ink,true);text(s,'Integrations, data migration, operational controls\nand acceptance testing complete the journey.',850,613,678,100,28,C.muted);
notes(s,'CRITICAL POSITIONING — The latest README and code supersede the old Module 01-only build specification. Authentication, inventory and POS are server-backed in a local single-process JSON adapter. Core Setup staff, location and policy screens use separate browser-local demo data; they do not update real login accounts or synchronize location edits into inventory. Real enforced roles are administered through Login Access. Modules 04–09 are roadmap items. Production infrastructure, durable transactional database, backups, identity hardening and security review remain rollout work. Keep this explanation short in the meeting, expand only when asked.','README.md; components/shell/app-shell.tsx');
}
// 05
{
const s=slide('Follow one product through the whole business','END-TO-END FLOW / COMPLETED ERP VISION');
flow(s,[['Set up','People, locations\nand access'],['Buy & receive','Vendor order\nto stock'],['Allocate','Store and online\navailability'],['Sell','Retail, B2B\nand channels']],285,{h:156});
flow(s,[['Return','Invoice-linked\nstock and credit'],['Reconcile','Cash, payouts\nand ledgers'],['Learn','Performance\nand demand'],['Reorder','Approved\npurchase plan']],535,{h:156});
callout(s,'Every handoff should leave a record the next team can use.',745);
notes(s,'Walk left-to-right on the top row, then left-to-right on the lower row. This is the full intended lifecycle. Today’s live example proves inventory-to-retail-to-return-to-shift-close; purchase orders, B2B, channels, financial posting and forecast planning are future modules. Transition to the first live capability: foundation and access.');
}
// 06
{
const s=slide('Give each team the right workspace','01 / CORE SETUP & ACCESS');
map(s,'PEOPLE +\nLOCATIONS',[
['Location structure','Stores, warehouses and fulfillment hubs'],['Business settings','Company profile and operating preferences'],['Role-based sign-in','Admin, inventory, POS manager and cashier'],['Information control','Restricted costs, module access\nand cashier activity']]);
notes(s,'SHOW: /core-setup, /core-setup/stores-warehouses, then /core-setup/login-access. Spend only a minute on configuration. SAY: “We start by organizing the business and deciding who can do what.” PROOF: Login Access has the actual authentication roles. If you show Users & Roles or Permissions, state they are policy design demonstrations, not the authorization engine. Optional prepared cashier login demonstrates restricted navigation; never change permissions during the meeting. Benefit: clearer responsibility and appropriate data access.','README.md; components/auth/accounts-page.tsx; components/core-setup/locations-page.tsx');
}
// 07
{
const s=slide('One catalog connects products, prices and stock','02 / PRODUCT & INVENTORY',false,'Actual demo interface • illustrative catalog data');
await img(s,TMP+'/catalog.png',72,260,960,540);
text(s,'Identify',1140,280,388,47,34,C.ink,true);text(s,'SKU, barcode, brand,\ncategory and size',1140,340,388,91,28,C.muted);
text(s,'Price',1140,458,388,47,34,C.ink,true);text(s,'Retail, wholesale,\nVIP and web levels',1140,518,388,90,28,C.muted);
text(s,'Control',1140,635,388,47,34,C.ink,true);text(s,'Costs, thresholds\nand product status',1140,695,388,90,28,C.muted);
notes(s,'SHOW: /product-inventory/products. Search SKU 10000, Lattafa Yara Pink; open its detail/edit view. Point to SKU, barcode, size and price levels. Switch to /product-inventory/pricing if pricing is a client priority. SAY: “One product record serves the whole operation.” No need to edit a price live. Catalog seed contains 26 illustrative products, not the client’s full database. Do not claim a completed legacy import. Current stock and prices may differ after prior demos.','README.md; data/inventory.ts; tmp/presentation-flair/catalog.png (local UI capture, 2026-09-02)');
}
// 08
{
const s=slide('Know what is available—and why it changed','02 / STOCK OPERATIONS');
flow(s,[['Receive','Post goods into\na location'],['Transfer','Move units between\nlocations'],['Count','Compare physical\nand recorded stock'],['Trace','Review the\nmovement history']],300,{h:177});
text(s,'Available stock',72,555,590,55,39,C.ink,true);text(s,'On hand − committed − held',72,620,710,60,39,C.teal,true);
text(s,'A posted movement preserves',910,557,618,50,32,C.ink,true);text(s,'Product • quantity • location\nReference • actor • date',910,620,618,94,30,C.muted);
notes(s,'SHOW: /product-inventory/stock, filter SKU 10000 and the Harwin Flagship location. Record baseline on-hand and available values. Go to /product-inventory/operations, create a receipt for 5 units of the same SKU at Harwin, use an illustrative cost, save draft then post. Return to stock: on-hand should rise by 5, assuming no concurrent activity. Optional transfer: 2 units from Harwin to Houston Main Warehouse, then inspect both balances. Drafts do not affect stock; posted documents are immutable. Supplier and bill fields are receipt references, not vendor payables. Held POS carts do not reserve inventory.','README.md; components/inventory/operation-dialog.tsx; types/inventory.ts');
}
// 09
{
const s=slide('Turn a counter sale into a traceable record','03 / RETAIL POS',false,'Actual demo interface • current counter workspace');
await img(s,TMP+'/pos.png',72,260,960,540);
text(s,'Scan & serve',1140,282,388,50,34,C.ink,true);text(s,'Find products, attach\na customer, review price',1140,342,388,103,28,C.muted);
text(s,'Confirm & sell',1140,475,388,50,34,C.ink,true);text(s,'Record tender and\nissue a receipt',1140,535,388,90,28,C.muted);
text(s,'See the result',1140,658,388,50,34,C.ink,true);text(s,'Sale history and\nupdated stock',1140,718,388,88,28,C.muted);
notes(s,'SHOW: /retail-pos. Preflight must confirm the tax configuration and an open cashier shift at the intended location. Attach a clearly labeled demo customer before sale if you will show store credit. Enter SKU 10000, sell 2 units, review the actual total, choose cash and confirm the demo tender. Only proceed once the server returns a confirmed receipt. Open /retail-pos/sales to retrieve it, then verify stock reduced by 2. SAY: “The receipt and stock movement are part of the same posted transaction.” Card and other external payments are recorded references only; Flair does not process a charge. Use the real on-screen tax/total, never an invented amount.','README.md; components/pos/terminal-page.tsx; tmp/presentation-flair/pos.png (local UI capture, 2026-09-02)');
}
// 10
{
const s=slide('Returns keep the original sale in view','03 / RETURNS, EXCHANGES & STORE CREDIT');
flow(s,[['Find invoice','Select the original\nconfirmed sale'],['Review return','Choose quantity\nand restock decision'],['Issue credit','Refund within limits\nor create store credit'],['Keep history','Retain receipt, return\nand credit movement']],310,{h:180});
columns(s,[['Resellable','Restock returned units\nwhen appropriate.'],['Damaged','Keep non-resellable goods\nout of sellable stock.'],['Exchange','Return to customer credit,\nthen create a new sale.']],564);
notes(s,'SHOW: /retail-pos/returns as an administrator or POS manager. Find the 2-unit demo sale, return 1 unit, choose restock=true and store credit for the attached demo customer. Check /retail-pos/customers: customer credit rises by the allocated original amount; inventory rises by 1. A manager must use the original invoice and cannot return more than sold. Exchanges are a separate sale after a credit return, not an atomic exchange operation. Non-restocked goods do not add to sellable stock. Do not promise a full repair/quarantine workflow today. Accounting customer/vendor ledgers for all channels arrive in later modules.','README.md; components/pos/management-pages.tsx');
}
// 11
{
const s=slide('Close the day with accountable cash control','03 / SHIFTS & RECONCILIATION');
flow(s,[['Open shift','Cashier, register\nand opening float'],['Record activity','Cash sales, refunds\nand cash movements'],['Count & close','Physical cash count\nwith variance reason'],['Review','Frozen closing record\nand manager export']],310,{h:184});
text(s,'Expected cash',72,575,680,58,39,C.ink,true);
text(s,'Opening float + net cash activity',72,643,870,55,37,C.teal,true);
text(s,'Variance',1070,575,458,58,39,C.ink,true);
text(s,'Counted − expected',1070,643,458,55,33,C.teal,true);
notes(s,'SHOW: /retail-pos/shifts. Confirm you are on the disposable demo shift before closing it. Review expected cash, enter the physical demo count and supply a reason if there is a variance. Open /retail-pos/reconciliation and inspect the closed record and export. SAY: “Managers see a recorded close, not a changing estimate.” Closed shifts cannot accept new sales or returns. Card-provider settlements are external and are not reconciled by this current cash report. Complete returns before closing the shift.','README.md; components/pos/management-pages.tsx');
}
// 12
{
const s=slide('Connect replenishment and reseller sales','04 + 05 / PROPOSED NEXT CAPABILITIES');
text(s,'PURCHASING & VENDORS',72,260,680,45,30,C.teal,true);text(s,'WHOLESALE & B2B PORTAL',870,260,658,45,30,C.gold,true);
flow(s,[['Order','Vendor pricing\nand terms'],['Receive','Match goods\nto the PO']],355,{x:72,w:680,h:155,gap:24});
flow(s,[['Reseller','Approved access\nand price terms'],['Order','Self-service\nB2B ordering']],355,{x:870,w:658,h:155,gap:24});
text(s,'Bills, purchase returns and vendor credits\ncreate an accountable buying trail.',72,552,680,124,30,C.muted);
text(s,'Shared catalog and inventory support\na consistent reseller experience.',870,552,658,124,30,C.muted);
callout(s,'Detailed B2B pricing, approvals and order rules are confirmed during discovery.',745);
notes(s,'These are roadmap modules. Purchasing scope in the proposal includes POs, goods received, vendor prices/terms/bills, history, suggested reorder quantities and vendor credit adjustments. The supplied PDF identifies Module 05 and the reseller network but does not include a dedicated detailed B2B page. Self-service ordering is named in the implemented roadmap sidebar; finer B2B workflows shown here are proposed for validation, not agreed commitments. Ask about minimum order quantities, credit limits, approvals and negotiated pricing.','ERP_Modules.pdf (pages 2, 4, 11); components/shell/app-shell.tsx');
}
// 13
{
const s=slide('Online orders use the same stock foundation','06 / E-COMMERCE HUB — PLANNED');
text(s,'Shopify   •   WooCommerce   •   eBay   •   TikTok Shop   •   Whatnot',72,243,1456,65,32,C.teal,true,'center');
flow(s,[['Channel order','Order, pricing\nand stock signals'],['Allocate','Check dedicated\ne-commerce stock'],['Fallback','Pull from main\nwarehouse if needed'],['Fulfill & sync','Update status\nand availability']],365,{h:172});
text(s,'Client-defined allocation rules',72,600,670,52,35,C.ink,true);text(s,'Decide which SKUs live in each warehouse.',72,667,710,94,28,C.muted);
text(s,'Connection readiness',885,600,643,52,35,C.ink,true);text(s,'Validate seller access and supported sync\nfor each channel before rollout.',885,667,643,94,28,C.muted);
notes(s,'This is the target scope from the proposal, not evidence of live integrations. Do not assert current API capability, instant synchronization or universal approval. Each seller account, region, platform permission, API behavior and sync cadence must be validated during discovery. Where direct access is restricted, agree a controlled import/export approach and its limitations. The dedicated e-commerce warehouse checks stock first, with main-warehouse fallback according to agreed allocation rules. Ask which channel should be connected first and who owns seller access.','ERP_Modules.pdf (pages 12–13, 20); README.md');
}
// 14
{
const s=slide('See what each channel actually contributes','07 / REPORTS & DASHBOARDS — PLANNED');
text(s,'Order contribution',72,248,1456,77,53,C.ink,true);
text(s,'Sales − discounts − refunds − channel fees\n− shipping cost − product cost',72,351,1456,126,42,C.teal,true);
rule(s,72,512,1456,C.gold);
columns(s,[['Compare','Order • channel • brand\nRetail vs. wholesale'],['Spot exceptions','Slow stock • weak contribution\nReturns • reconciliation gaps'],['Act','Adjust buying, pricing\nand channel priorities']],557);
notes(s,'The source proposal labels this formula Net Profit. Present it more precisely as order contribution because company overheads, financing and income tax may sit outside it. It is not the company’s final net income. Module 07 is planned and depends on all operational sales/purchase feeds; profitability requires reliable fee, shipping and cost capture. Map payout timing and each channel’s cost fields before defining dashboards. No illustrative revenue or ROI claims are used.','ERP_Modules.pdf (pages 14–15)');
}
// 15
{
const s=slide('Turn demand history into a buying plan','08 / SMART DEMAND FORECASTING — PLANNED',true);
text(s,'What to buy. How much. When.',72,224,1456,91,55,C.ivory,true);
const pts=[[72,'Read demand','30 / 60 / 90-day sales\nand inventory history'],[584,'Recommend','Reorder quantities, safety\nstock and seasonal needs'],[1096,'Decide','Buyer reviews and approves\nthe replenishment plan']];
line(s,72,389,1528,389,C.gold);
pts.forEach(([x,a,b],i)=>{text(s,String(i+1).padStart(2,'0'),x,334,400,55,36,C.gold,true);text(s,a,x,433,432,50,36,C.ivory,true);text(s,b,x,510,432,139,31,'#CBDAD6');});
text(s,'Better recommendations begin with reliable stock and sales-channel data.',72,723,1456,70,32,C.ivory,true);
notes(s,'Position this as the flagship proposed capability. SAY: “The goal is to turn recurring spreadsheet review into a ranked buying recommendation your team can inspect.” Inputs must include sufficient sales history, stock accuracy, lead-time assumptions and relevant channel feeds. Keep buyer review in the loop; do not promise zero manual work, perfect forecasts or guaranteed savings. Agree how to evaluate recommendations and measure forecast error before production use. Depends on Modules 02 and 06 in the supplied scope.','ERP_Modules.pdf (pages 6–7, 16)');
}
// 16
{
const s=slide('Bring finance closer to daily operations','09 / ACCOUNTING & FINANCE — PLANNED');
map(s,'OPERATIONAL\nRECORD → BOOKS',[
['Customer side','Invoices, receivables, refunds\nand customer credit notes'],['Vendor side','Bills, payables, purchase returns\nand vendor credits'],['Financial control','General ledger, bank reconciliation\nand sales-tax workflows'],['Management view','P&L, Balance Sheet, payroll entries\nand post-dated check tracking']]);
notes(s,'All accounting capabilities are planned. The intended result is operational transactions feeding agreed accounting mappings. Scope includes basic payroll entries, not a complete payroll service. PDCs cover customer and vendor checks, due/clearance dates, pending/due-soon/cleared/bounced statuses and reminders. Confirm chart of accounts, opening balances, tax rules, cutoffs and accounting ownership with the client’s finance lead. POS customer store credit today is not yet a full accounts-receivable ledger.','ERP_Modules.pdf (pages 17–19); README.md');
}
// 17
{
const s=slide('What your team receives at completion','CUSTOMER HANDOVER / PROPOSED ACCEPTANCE PACKAGE');
map(s,'YOUR ERP\nREADY TO RUN',[
['Configured platform','Nine agreed modules\nRoles, locations and workflows'],['Connected information','Approved migration and channel feeds\nValidated balances and records'],['Operational visibility','Reports, exports and traceable\nstock, sales and financial activity'],['Ready-to-run handover','Training, operating guides, access\nand agreed recovery procedures']]);
notes(s,'The nine-module platform is the source proposal scope. The handover package is our proposed completion checklist and must be confirmed in the implementation agreement: configuration, agreed migration, integrations, acceptance evidence, training, guides, administrator access and tested recovery procedures. Do not promise unlimited support, hosting, source-code/IP ownership or a maintenance SLA without agreement. The proposal states that post-implementation maintenance and support are quoted separately.','ERP_Modules.pdf (pages 4, 21–22); README.md');
}
// 18
{
const s=slide('Deliver in phases. Validate before expanding.','ROLLOUT / THREE DELIVERY GATES');
columns(s,[['01  Operate','Setup • inventory • POS\nPurchasing & vendors\n\nGate: stock, sale, return\nand buying flows accepted.'],['02  Expand','Wholesale • e-commerce\nReports & dashboards\n\nGate: channel orders, stock\nand cost data reconcile.'],['03  Optimize','Forecasting • finance\n\nGate: buying recommendations\nand financial outputs\nvalidated by business owners.']],275);
callout(s,'Dates and investment follow confirmed scope, data readiness and integration access.',746);
notes(s,'The three phases reproduce the source proposal. Current demo covers portions of Phase 1; purchasing and production readiness remain to be completed. Recommend a controlled pilot, migration rehearsal, reconciled opening balances, trained users and business sign-off before broad rollout. Agree a rollback/recovery procedure. Do not invent weeks, launch dates, pricing or percentages. Client prerequisites include data, access and business process decisions.','ERP_Modules.pdf (pages 4, 21–22); README.md');
}
// 19
{
const s=slide('Measure the change that matters to the business','EXPECTED BENEFITS / VALIDATE THROUGH THE PILOT');
const rows=[['Stock confidence','Fewer stock discrepancies','Count accuracy; oversell exceptions'],['Counter efficiency','Smoother customer service','Checkout time; return handling time'],['Cash accountability','Clearer daily close','Close time; unexplained variance'],['Buying quality','More informed replenishment','Stockout days; aged-stock value'],['Channel visibility','Better commercial decisions','Orders with complete cost data']];
text(s,'BUSINESS AREA',72,252,335,42,24,C.teal,true);text(s,'INTENDED BENEFIT',465,252,490,42,24,C.teal,true);text(s,'MEASURE TO AGREE',1015,252,513,42,24,C.teal,true);
rows.forEach((r,i)=>{const y=322+i*88;rule(s,72,y-13,1456);text(s,r[0],72,y,335,67,29,C.ink,true);text(s,r[1],465,y,490,67,28,C.muted);text(s,r[2],1015,y,513,70,26,C.muted);});
notes(s,'These are qualitative expected benefits and proposed measures, not achieved results. Capture a baseline before the pilot, agree target improvements with the client and review after an agreed period. Ask: “Which two measures would make this a clear success for you?” Do not quote invented savings or guaranteed ROI.','ERP_Modules.pdf (pages 2, 7, 14–16); README.md');
}
// 20
{
const s=slide('Let’s agree the first operating milestone','DISCUSSION / NEXT DECISIONS',true);
text(s,'Start with one location.\nProve one connected flow.',72,249,1456,164,65,C.ivory,true);
const rows=[['01','Priority','Which process should improve first?'],['02','Pilot','Which location, users and products?'],['03','Readiness','Who provides data, rules and channel access?'],['04','Acceptance','What evidence will confirm success?']];
rows.forEach((r,i)=>{const y=468+i*77;text(s,r[0],72,y,85,48,30,C.gold,true);text(s,r[1],175,y,310,48,33,C.ivory,true);text(s,r[2],530,y,998,54,31,'#CBDAD6');});
notes(s,'CLOSE — Say: “You have seen the operational foundation and the path to a complete ERP. Let’s choose the pilot location and the first outcome we will prove together.” Capture four decisions: priority process, pilot owner/location, data/access owner and acceptance criteria. Then agree the next discovery session. Avoid committing to dates or commercial terms before scope is confirmed. Client-facing presentation ends here. The remaining slides are a presenter playbook and are hidden from normal slideshow playback.');
}
// 21–25 / Hidden presenter playbook, deliberately practical.
{
const s=slide('Run the meeting as one business story','PRESENTER PLAYBOOK / SUGGESTED 30-MINUTE RUN');
const rows=[['00–03','Discover the priority','Open on slides 1–2; ask about their biggest operational bottleneck.'],['03–07','Frame the platform','Use slides 3–5 to explain nine modules, today’s demo and the full flow.'],['07–20','Demonstrate one SKU','Setup → catalog → receive → sell → return → close → verify.'],['20–26','Show the completed ERP','Use slides 12–19; emphasize the modules tied to their stated priority.'],['26–30','Agree the next step','Slide 20: pilot location, owner, inputs and acceptance measures.']];
rows.forEach((r,i)=>{const y=250+i*105;rule(s,72,y-9,1456);text(s,r[0],72,y+7,220,49,31,C.teal,true);text(s,r[1],320,y+7,490,50,32,C.ink,true);text(s,r[2],840,y+7,688,94,27,C.muted);});
notes(s,'Keep the slideshow on slide 5 while introducing the live demo, then switch to the app. Slides 6–11 are supporting explanations and screenshot fallback; do not narrate every slide and then repeat it in the app. Return at slide 12. If time is short, show a 2-unit sale, 1-unit return and stock change; skip transfer and optional pricing views. Customer-facing sequence ends at slide 20.');
}
{
const s=slide('Prepare the demo before the customer arrives','PRESENTER PLAYBOOK / PRE-FLIGHT');
columns(s,[['Environment','Use a disposable demo dataset.\nConfirm server and login.\nKeep app and deck ready.\nRehearse the exact route.'],['Scenario','SKU 10000: Yara Pink.\nHarwin Flagship location.\nOne labeled demo customer.\nRecord opening stock values.'],['Checkout','Confirm sample tax settings.\nOpen the demo cashier shift.\nCheck opening cash float.\nTest receipt print preview.']],263);
callout(s,'Use demo tender only. Keep business inventory and the client’s live register untouched.',746);
notes(s,'Current project location: D:/echo-work/flair-perfumes. Local app: http://localhost:3000. Use an authorized prepared administrator/POS manager session and a separate prepared cashier session only if needed. Do not put credentials on screen or in the deck. The demo modifies stock, sales, credit and shifts: rehearse in a disposable data directory, not business inventory. FLAIR_DATA_DIR can select an isolated persistent folder for a separately prepared instance. Do not reset the live app during the meeting. Stock seed is illustrative; use the observed baseline. Complete setup and verify stock, tax configuration and correct location before admitting the client. Hardware compatibility and actual printer/scanner behavior must be tested on the intended device.','README.md; data/inventory.ts');
}
{
const s=slide('Demo route: establish control, then receive stock','PRESENTER PLAYBOOK / LIVE ACTIONS 1–4');
const rows=[['1','Core Setup → Login Access','Show actual sign-in roles. “People get the right workspace.”','Proof: role-specific access is visible.'],['2','Product Catalog → search 10000','Open Yara Pink. Show SKU, barcode, price levels and size.','Proof: one identifiable product record.'],['3','Stock Explorer → Harwin','Record on-hand and available stock before any posting.','Proof: a baseline the customer can compare.'],['4','Stock Operations → receipt','Receive 5 units; save the draft, post, then refresh stock.','Proof: on-hand = baseline + 5.']];
rows.forEach((r,i)=>{const y=250+i*130;text(s,r[0],72,y,72,52,38,C.gold,true);text(s,r[1],180,y,1348,48,33,C.ink,true);text(s,r[2],180,y+53,1348,37,27,C.muted);text(s,r[3],180,y+92,1348,40,25,C.teal,true);});
notes(s,'PATHS:\n1 /core-setup and /core-setup/login-access. Optional /core-setup/stores-warehouses. Explain browser-local setup limitations when relevant.\n2 /product-inventory/products. Use SKU 10000 / Lattafa Yara Pink; do not rely on product row position.\n3 /product-inventory/stock. Filter product and Harwin; record actual onHand and available values.\n4 /product-inventory/operations. Choose Stock receipt, Harwin, one line, SKU 10000, quantity 5, an explicitly illustrative unit cost and a DEMO reference. Save then post. Confirm stock +5 and inspect movement history. Do not describe receipt supplier fields as a PO or payable.\nOptional: transfer 2 units to Houston Main Warehouse. If performed, adjust the later expected Harwin stock by -2. Avoid this optional step when time is tight.','README.md; components/inventory/operation-dialog.tsx; data/inventory.ts');
}
{
const s=slide('Demo route: sell, return and close the loop','PRESENTER PLAYBOOK / LIVE ACTIONS 5–8');
const rows=[['5','POS → attach demo customer → sell 2','Review price and tax; record demo cash; show confirmed receipt.','Proof: sale recorded; stock decreases by 2.'],['6','Returns → original receipt → return 1','Choose restock and store credit for the attached customer.','Proof: stock increases by 1; credit history records the amount.'],['7','Customer Accounts → inspect credit','Show purchase history, credit balance and credit movement.','Proof: the customer account links back to the transaction.'],['8','Cashier Shifts → close → reconciliation','Review expected cash; enter count; explain any variance.','Proof: frozen close record. Final stock = baseline + 4.*']];
rows.forEach((r,i)=>{const y=238+i*130;text(s,r[0],72,y,72,52,38,C.gold,true);text(s,r[1],180,y,1348,48,33,C.ink,true);text(s,r[2],180,y+53,1348,37,27,C.muted);text(s,r[3],180,y+92,1348,40,25,C.teal,true);});
text(s,'*Assumes +5 received, −2 sold, +1 restocked, no transfer and no concurrent activity.',180,786,1348,33,22,C.muted);
notes(s,'PATHS:\n5 /retail-pos then /retail-pos/sales. Ensure configured tax and an open shift. Attach the labeled demo customer first. Enter 10000, quantity 2. Use current actual price and tax, not a preset total. Record cash only in the disposable demo; await confirmed sale.\n6 /retail-pos/returns. Use manager/admin, select the original receipt and quantity 1. Restock true, issue store credit. Returns use original price/discount/tax allocation.\n7 /retail-pos/customers. Check customer credit and history. Optional exchange: redeem part of the credit in a separate sale; if you do, recompute expected stock and mention it.\n8 /retail-pos/shifts then /retail-pos/reconciliation. Close only the demo shift after completing sales and returns. Expected cash includes the full cash sale when the return is store credit, because no cash refund left the drawer. Show the frozen report and export.\nNumeric proof: baseline B → B+5 after receipt → B+3 after 2-unit sale → B+4 after restocking 1. This proves the transaction chain without inventing a starting quantity.','README.md; components/pos/terminal-page.tsx; components/pos/management-pages.tsx');
}
{
const s=slide('Answer clearly—and always return to value','PRESENTER PLAYBOOK / QUESTIONS & FALLBACK');
const rows=[['“Is everything live?”','Inventory and retail flows are working; Modules 04–09 are planned.'],['“Are cards and channels connected?”','Card approvals are external today. Seller connections require validation.'],['“Does it work offline?”','Loaded checkout can queue cash commands; only confirmed sales are final.'],['“What about rollout and support?”','Agree data, pilot and acceptance first; ongoing support is quoted separately.']];
rows.forEach((r,i)=>{const y=257+i*103;rule(s,72,y-12,1456);text(s,r[0],72,y,675,80,31,C.ink,true);text(s,r[1],825,y,703,91,28,C.muted);});
callout(s,'If the app stalls: use slides 7–11, explain the intended result, and capture the open question.',746);
notes(s,'OFFLINE DETAIL: The current implementation supports an active-session cash-only pending queue if server confirmation fails. It is not an installable offline-first app. Initial load, external tenders and store credit need connection; stock/price/tax changes or a closed shift can conflict. Pending commands are not final receipts. Do not collect payment or release goods until confirmed; do not clear browser storage with pending sales.\nPAYMENTS: Flair records externally processed card references and never collects card details or charges a card.\nACCESS: Core Setup staff/policy editors are demo configuration; Login Access controls real roles.\nPRODUCTION: Current JSON persistence is a local single-process adapter. A production plan needs transactional storage, recovery, identity/security work and operational acceptance.\nCOMMERCIAL: No dates, pricing or support SLA are confirmed in this deck.\nFALLBACK: Do not repeatedly click payment/post. Inspect Sales History first if confirmation is uncertain. Present screenshot slides, state what was and was not confirmed, and agree follow-up.\nCLOSE: “Which location should we pilot, who will own the data, and what result should we prove first?”','README.md; ERP_Modules.pdf (page 22)');
}

await fs.mkdir(TMP+'/render',{recursive:true});
await fs.writeFile(TMP+'/source-notes.txt', 'Communication job: help Flair decision-makers understand the complete nine-module ERP, distinguish current demo from proposed completion, and agree a pilot.\nCustom visual direction: requested mind-map format, Flair teal/ivory/champagne brand. No default template.\nSources: local ERP_Modules.pdf, README.md, source components, local brand assets and captured current UI. No external research or quantified ROI claims.\nScreenshots: local app observed 2026-09-02; demo data only.\nB2B details and handover services beyond explicit source scope are proposed for confirmation.\nSlides 21-25 are presenter-only appendix and will be hidden for normal slideshow playback.\n');
await fs.writeFile(TMP+'/slide-index.txt',records.map(r=>r.slide+' '+r.title).join('\n'));
await fs.writeFile(TMP+'/deck.json',JSON.stringify(p.toProto()));
const pptx=await PresentationFile.exportPptx(p);await pptx.save(OUT);console.log('PPTX '+OUT);
for(let i=0;i<p.slides.items.length;i++){
 const s=p.slides.items[i],stem=TMP+'/render/slide-'+String(i+1).padStart(2,'0');
 await fs.writeFile(stem+'.png',new Uint8Array(await (await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));
 await fs.writeFile(stem+'.json',await (await s.export({format:'layout'})).text());
 console.log('Rendered '+(i+1));
}
console.log('DONE '+p.slides.items.length);
