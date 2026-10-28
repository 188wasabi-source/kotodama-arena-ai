'use strict';
/* Kotodama Arena — original, offline-playable narrative battle game. */
const KEY = 'kotodama_arena_save_v1';
const AI_KEY = 'kotodama_arena_gemini_connection_v2';
const DEFAULT_POWER = '全ての可能世界に同時存在し、被害のある世界を捨てる。敵の存在を支える因果の起点へ全時空から攻撃する。';
const POWER_PRESETS = [
 '敵の攻撃を光に変換し蓄積する。蓄えた光を凝縮して、時間差で無数の光槍として解き放つ。',
 '未来の動きを数秒先まで読み、影を分身に変える。影は別々の戦術で連携し、敵の死角から迫る。',
 '触れた空間を折り畳み、あらゆる方向から剣閃を放つ。空間の歪みを盾として攻撃を逸らす。',
 '傷つくたびに肉体が進化して再生する。倒される寸前に蓄えた力を解放し、絶大な衝撃波を放つ。',
 '周囲の音を支配し、衝撃波と幻聴で敵を翻弄する。無音の領域では超高速で移動できる。',
 '確率を少しずつ偏らせ、敵の攻撃を紙一重で避ける。無数の小さな幸運を大逆転へとつなぐ。',
 '星の重力を模した結界を張る。敵を中心へ引き寄せつつ、自分は空間を跳躍し遠距離から攻める。',
 DEFAULT_POWER
];
const ENEMIES = [
 {id:'ember',name:'灰燼の剣士',epithet:'紅蓮を宿す騎士',emoji:'⚔',tier:'normal',stars:1,ability:'炎を纏う剣で連続攻撃を放ち、灼熱の盾で正面からの攻撃を防ぐ。',tags:['炎','剣','防御'],stats:{attack:6,defense:3,speed:4,control:1,cosmic:0},weak:['氷','水','空間'],focus:'灼熱の斬撃'},
 {id:'shade',name:'夜霧の暗殺者',epithet:'影に潜む無音の刃',emoji:'☾',tier:'normal',stars:1,ability:'影と同化して気配を消し、超高速で死角に回り込み、毒の刃で一撃を狙う。',tags:['影','速度','毒'],stats:{attack:5,defense:2,speed:7,control:2,cosmic:0},weak:['光','感知','結界'],focus:'見えない刃'},
 {id:'glacier',name:'氷晶の魔女',epithet:'絶対零度を操る少女',emoji:'❄',tier:'normal',stars:2,ability:'氷の壁と分身で相手を惑わせ、周囲の温度を奪って動きを封じる。',tags:['氷','分身','拘束'],stats:{attack:4,defense:6,speed:3,control:6,cosmic:0},weak:['炎','熱','破壊'],focus:'氷の監獄'},
 {id:'colossus',name:'鋼鉄の巨神',epithet:'不落の古代兵器',emoji:'♜',tier:'hard',stars:3,ability:'鋼の巨体は通常の攻撃をものともせず、大地を砕く拳と重力の咆哮で敵を圧倒する。',tags:['防御','物理','重力'],stats:{attack:8,defense:9,speed:1,control:3,cosmic:0},weak:['精神','内部','空間','速度'],focus:'山を砕く鉄拳'},
 {id:'oracle',name:'逆刻の預言者',epithet:'未来を観測する賢者',emoji:'⌛',tier:'hard',stars:3,ability:'数秒先の未来を視認し、時間を巻き戻して失敗をやり直す。相手の行動を先読みして迎撃する。',tags:['時間','未来','戦術'],stats:{attack:4,defense:5,speed:5,control:9,cosmic:5},weak:['確率','無数','因果'],focus:'未来からの迎撃'},
 {id:'dream',name:'夢喰いの女王',epithet:'意識を彷徨わせる支配者',emoji:'♛',tier:'hard',stars:4,ability:'意識に干渉し、現実と夢の境界を曖昧にする。幻想の迷宮へ誘い込み、心の隙を狙う。',tags:['精神','幻覚','概念'],stats:{attack:4,defense:6,speed:4,control:9,cosmic:6},weak:['意志','光','現実','自動'],focus:'永遠の夢迷宮'},
 {id:'void',name:'虚無の観測者',epithet:'境界の外より来た者',emoji:'◈',tier:'legend',stars:5,ability:'空間と概念の境界を操り、攻撃を異なる次元へ流す。存在する場所を常に変えて反撃する。',tags:['空間','概念','防御'],stats:{attack:7,defense:10,speed:7,control:9,cosmic:10},weak:['因果','観測','全時空'],focus:'境界の彼方'},
 {id:'fate',name:'終焉の書記官',epithet:'運命を書き留める者',emoji:'✧',tier:'legend',stars:5,ability:'あらゆる出来事の因果を読み解き、その分岐点で運命を編み直す。世界に刻まれた法則を利用する。',tags:['因果','運命','世界'],stats:{attack:8,defense:9,speed:7,control:10,cosmic:13},weak:['無数','未来','適応','逆転'],focus:'運命の筆跡'}
];
const CATEGORIES = [
 {id:'attack',label:'攻撃',weight:1,terms:[/攻撃|斬撃|剣|刀|槍|拳|衝撃|爆発|雷|炎|火炎|破壊|焼き|射撃|砲撃|毒|光弾|刃|突き|貫く|撃つ|放つ|ビーム|必殺|一撃|波動/g]},
 {id:'defense',label:'防御',weight:1.05,terms:[/防御|守る|結界|盾|障壁|バリア|無傷|耐性|回復|再生|治癒|不死|不滅|復活|回避|逸らす|吸収|変換|受け流す|防ぐ|復元|被害|無効な世界/g]},
 {id:'speed',label:'速度',weight:.88,terms:[/速度|高速|光速|瞬間|瞬時|転移|移動|跳躍|先手|回避|分身|残像|先読み|予知|未来|時を止|時間停止|時空/g]},
 {id:'control',label:'制御',weight:1.15,terms:[/支配|操作|操る|拘束|封じ|停止|時間|空間|重力|精神|幻覚|認識|確率|干渉|誘導|呪い|音|眠り|夢|束縛|凍結|温度|歪み/g]},
 {id:'cosmic',label:'超常',weight:1.5,terms:[/因果|概念|可能世界|並行世界|全時空|存在|法則|運命|世界|次元|無限|創造|消滅|起点|宇宙|現実|過去|未来|魂|事象|物語|観測|真理|原理/g]},
 {id:'tactics',label:'戦術',weight:1.05,terms:[/適応|学習|解析|分析|戦術|連携|策略|変化|工夫|応じ|備え|予測|偽装|不可視|隠密|囮|反撃|カウンター|増幅|蓄積|同時|無数|全方向|一斉|常に|自動|先に|全て|あらゆる/g]}
];
const COUNTER_RULES = [
 {a:/氷|冷気|凍結|水/,b:/炎|火炎|灼熱|燃焼/,label:'元素の相克'},
 {a:/炎|火炎|熱|溶解/,b:/氷|冷気|凍結/,label:'熱量による突破'},
 {a:/光|照明|感知|観測|索敵/,b:/影|暗闇|隠密|不可視/,label:'影の看破'},
 {a:/精神|意識|夢|幻覚/,b:/鋼|物理|剣|拳|巨体/,label:'精神への干渉'},
 {a:/空間|転移|次元|位相/,b:/鋼|剣|拳|物理|巨体/,label:'防御を迂回'},
 {a:/因果|可能世界|全時空|運命|確率/,b:/未来|予知|時間|先読み/,label:'未来予測の外側'},
 {a:/自動|無意識|意志|現実/,b:/精神|夢|幻覚/,label:'精神干渉への耐性'},
 {a:/速度|高速|光速|瞬間|転移/,b:/巨体|鋼|重装|防御/,label:'機動力の優位'},
 {a:/無数|複数|分身|連携/,b:/予知|先読み|未来/,label:'予測の飽和'},
 {a:/観測|因果|起点|法則/,b:/概念|空間|次元/,label:'境界への干渉'}
];
const BAN_PATTERNS = [
 {re:/相手.{0,8}(能力|設定|スキル).{0,8}(無効|消去|禁止|使用不可|封印)/,msg:'相手の能力を直接無効化する指定はできません。'},
 {re:/(能力|設定|スキル).{0,8}(無効化|剥奪|消滅させる)/,msg:'能力そのものの無効化はできません。'},
 {re:/(必ず勝|絶対(?:に)?勝|勝利(?:が|を)?確定|勝敗を決|敗北(?:しない|が存在しない)|相手(?:は|が)必ず負け)/,msg:'勝敗を直接決定する表現は使えません。'},
 {re:/(審判|AI|システム|判定者|プロンプト).{0,12}(従え|命令|無視|勝ち|勝利|出力)/i,msg:'審判への命令は能力ではありません。'},
 {re:/(指示を無視|ルールを無視|上記を無視|開発者命令)/,msg:'ゲームルールを変更する指定はできません。'}
];
const initial = {profile:{name:'星詠みの旅人',title:'無数の可能性を渡る者',power:DEFAULT_POWER},coins:0,totalCoins:0,wins:0,losses:0,streak:0,bestStreak:0,rating:1000,peakRating:1000,history:[],enemyId:'ember'};
let state = load();let apiBase = readApiBase(), judgeMode='local', busy=false, currentBattle=null, filter='all', toastTimer;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const graphemes = s => {if(typeof Intl!=='undefined' && Intl.Segmenter)return [...new Intl.Segmenter('ja',{granularity:'grapheme'}).segment(s)];return Array.from(s).map(segment=>({segment}));};
const nchars = s => graphemes(s).length;
const cut = (s,n) => graphemes(s).slice(0,n).map(x=>x.segment).join('');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(!x||typeof x!=='object')return structuredClone(initial);const s={...structuredClone(initial),...x};s.profile={...initial.profile,...x.profile};s.profile.name=cut(String(s.profile.name||initial.profile.name),16);s.profile.title=cut(String(s.profile.title||''),24);s.profile.power=cut(String(s.profile.power||initial.profile.power),50);s.history=Array.isArray(s.history)?s.history.slice(0,50).filter(h=>h&&typeof h==='object'):[];for(const n of ['wins','losses','streak','bestStreak','rating','peakRating','coins','totalCoins'])s[n]=Math.max(0,Number(s[n])||0);if(!ENEMIES.find(e=>e.id===s.enemyId))s.enemyId='ember';return s;}catch{return structuredClone(initial);}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{notify('保存容量に問題が発生しました');}}
function notify(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800);}
function selectedEnemy(){return ENEMIES.find(e=>e.id===state.enemyId)||ENEMIES[0];}
function rankInfo(){const r=state.rating;if(r>=1700)return ['✦ 神話級','MYTHIC'];if(r>=1450)return ['✦ 伝説の術師','LEGEND'];if(r>=1250)return ['✦ 熟練術師','MASTER'];if(r>=1100)return ['✦ 上級術師','VETERAN'];return ['✦ 見習い術師','NOVICE'];}
function render(){const p=state.profile,e=selectedEnemy(),b=state.wins+state.losses;
 $('#topCoins').textContent=state.coins.toLocaleString('ja-JP');$('#heroRank').textContent=rankInfo()[0];$('#statBattles').textContent=b;$('#statWins').textContent=state.wins;$('#statStreak').textContent=state.streak;$('#statRating').textContent=state.rating.toLocaleString('ja-JP');
 $('#arenaPlayerName').textContent=p.name;$('#arenaPlayerAbility').textContent=p.power;$('#arenaEnemyName').textContent=e.name;$('#arenaEnemyAbility').textContent=e.ability;$('#arenaEnemyEmoji').textContent=e.emoji;$('#selectedTier').textContent={normal:'NORMAL',hard:'HARD',legend:'LEGEND'}[e.tier];
 $('#recordWinRate').textContent=(b?Math.round(state.wins/b*100):0)+'%';$('#recordBest').textContent=state.bestStreak;$('#recordTotalCoins').textContent=state.totalCoins.toLocaleString();$('#recordPeak').textContent=state.peakRating.toLocaleString();renderHistory();renderEnemies();}
function renderEnemies(){const box=$('#enemyGrid');box.innerHTML=ENEMIES.filter(x=>filter==='all'||x.tier===filter).map(e=>`<article class="enemy-card"><div class="enemy-card-head"><div class="enemy-face" aria-hidden="true">${e.emoji}</div><div><h3>${esc(e.name)}</h3><p class="enemy-epithet">${esc(e.epithet)}</p></div></div><div class="enemy-meta"><span class="stars" aria-label="難易度 ${e.stars}/5">${'★'.repeat(e.stars)}${'☆'.repeat(5-e.stars)}</span><span>${{normal:'初級',hard:'上級',legend:'伝説級'}[e.tier]}</span></div><div class="enemy-ability">${esc(e.ability)}</div><button class="btn ${state.enemyId===e.id?'btn-primary':'btn-outline'}" data-select-enemy="${e.id}">${state.enemyId===e.id?'この相手と戦う →':'挑戦する →'}</button></article>`).join('');}
function renderHistory(){const box=$('#historyList');if(!state.history.length){box.innerHTML='<div class="empty"><i>✦</i>まだ戦歴がありません。<br>最初の戦いを始めましょう。</div>';return;}box.innerHTML=state.history.map(h=>`<div class="history-row ${h.won?'':'loss'}"><div class="history-icon">${h.won?'✦':'✕'}</div><div class="history-main"><b>${h.won?'勝利':'敗北'} — ${esc(String(h.enemyName||'挑戦者').slice(0,25))}</b><p>${esc(String(h.date||''))} · ${esc(h.mode==='ai'?'AI審判':'ローカル審判')}</p></div><div class="history-rating">${h.ratingDelta>=0?'+':''}${Number(h.ratingDelta||0)}</div></div>`).join('');}
function navigate(page){if(!$('#page-'+page))return;$$('.page').forEach(el=>el.classList.toggle('active',el.id==='page-'+page));$$('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));$('#currentPageLabel').textContent={arena:'アリーナ',forge:'能力創造',enemies:'挑戦者',records:'戦歴',howto:'遊び方',settings:'AI接続設定'}[page];if(page==='forge')syncForm();window.scrollTo({top:0,behavior:'smooth'});}
function syncForm(){$('#nameInput').value=state.profile.name;$('#titleInput').value=state.profile.title;$('#powerInput').value=state.profile.power;updatePreview();}
function checkPower(s){if(nchars(s)>50)return '能力は50文字以内で入力してください。';if(!s.trim())return '能力を入力してください。';for(const ban of BAN_PATTERNS)if(ban.re.test(s))return ban.msg;return ''}
function updatePreview(){const name=$('#nameInput').value.trim(),title=$('#titleInput').value.trim(),power=$('#powerInput').value;$('#previewName').textContent=name||'名無しの術師';$('#previewTitle').textContent=title||'まだ名もなき挑戦者';$('#previewAbility').textContent=power||'能力を入力すると、ここに表示されます。';const n=nchars(power);$('#powerCount').innerHTML=n+' <span>/ 50</span>';const err=checkPower(power);$('#powerValidation').textContent=err;$('#powerHint').textContent=n===50?'文字数ぴったり！':n>45?'あと'+(50-n)+'文字':'能力の特徴を具体的に書こう';$('#saveProfile').disabled=!!err||!name;}
function saveProfile(){const name=$('#nameInput').value.trim(),title=$('#titleInput').value.trim(),power=$('#powerInput').value.trim();if(nchars(name)>16){notify('名前は16文字以内にしてください');return;}if(!name){notify('キャラクター名を入力してください');return;}const err=checkPower(power);if(err){notify(err);return;}state.profile={name,title:cut(title,24),power};persist();render();notify('能力を保存しました ✦');navigate('arena');}
function analyze(text){const found={},s=text.normalize('NFKC');for(const cat of CATEGORIES){const hits=new Set();for(const term of cat.terms){const matches=s.match(term)||[];matches.forEach(x=>hits.add(x));}found[cat.id]=Math.min(11,hits.size*1.75)*cat.weight;}let variety=Object.values(found).filter(v=>v>0).length;let lengthBonus=Math.min(2.2,nchars(s)/21);let total=3.2+Object.values(found).reduce((a,b)=>a+b,0)*.75+Math.min(6,variety*1.25)+lengthBonus;return{found,total,variety};}
function localJudge(p,e){const pa=analyze(p.power),ea=analyze(e.ability);const en=Object.values(e.stats).reduce((a,b)=>a+b,0);let scoreP=pa.total,scoreE=en*.65+ea.total*.45+e.stars*1.5;
 const counters=COUNTER_RULES.filter(rule=>rule.a.test(p.power)&&rule.b.test(e.ability));const reverse=COUNTER_RULES.filter(rule=>rule.a.test(e.ability)&&rule.b.test(p.power));scoreP+=Math.min(8,counters.length*3.4);scoreE+=Math.min(6,reverse.length*2.7);
 const classAttack=pa.found.attack,classDefense=pa.found.defense;scoreP+=Math.min(3,Math.sqrt(classAttack*classDefense)*.45);
 const random=(Math.random()-.5)*12;const difference=scoreP-scoreE+random;const probability=1/(1+Math.exp(-difference/7.5));let won=Math.random()<probability;
 // A strong design is favored but even overwhelming powers must allow uncertainty.
 const lead=won?'player':'enemy';const activeTags=Object.entries(pa.found).filter(([k,v])=>v>1).sort((a,b)=>b[1]-a[1]).map(([k])=>({attack:'攻撃',defense:'防御',speed:'速度',control:'制御',cosmic:'超常',tactics:'戦術'}[k]));
 const highlight=counters[0]?.label||reverse[0]?.label||'能力の激突';
 const openings=[`静寂を切り裂き、${e.name}が${e.focus}を仕掛ける。${p.name}はその異変を察知し、固有の力を解き放った。`,`闘技場の空気が張り詰める。${e.name}の${e.focus}が空間を震わせ、${p.name}もまた一歩を踏み出した。`,`開戦の鐘が鳴る。${e.name}が先制するも、${p.name}は自身の異能力で迎え撃つ。`];
 const midPlayer=[`${p.name}は能力の本質を利用し、敵の攻勢を逆手に取る。${highlight}が生む一瞬の綻びを逃さず、戦局の主導権を奪った。`,`${p.name}の力は単なる破壊に留まらない。${activeTags[0]||'独創的な力'}を軸とした組み立てが、${e.name}の防衛線を少しずつ崩していく。`];
 const midEnemy=[`しかし${e.name}は${e.focus}を畳み掛ける。${p.name}の能力も確かに発動するが、決定的な隙を作るまでには至らない。`,`互いの異能力が衝突する中、${e.name}は経験と特性を活かして間合いを支配。${p.name}は苦しい対応を迫られた。`];
 const climax=won?[`最後は${p.name}が機を捉える。${e.name}の猛攻をくぐり抜けて決定打を叩き込み、勝負が決した。`,`一瞬の攻防の後、立っていたのは${p.name}だった。創意が強敵の壁を破ったのだ。`]:[`最後まで抗った${p.name}だったが、${e.name}の${e.focus}が紙一重で上回る。勝者は挑戦者となった。`,`攻防は激しさを増したが、決定的な瞬間に${e.name}が競り勝った。${p.name}の新たな挑戦が始まる。`];
 const pick=a=>a[Math.floor(Math.random()*a.length)];return {won,story:[pick(openings),pick(won?midPlayer:midEnemy),pick(climax)],tags:[...activeTags.slice(0,2),...(counters.length?['相性優勢']:[]),`戦術評価 ${Math.round(scoreP)}`],mode:'local',confidence:Math.round(probability*100)};
}
function readApiBase(){try{return validEndpoint(localStorage.getItem(AI_KEY)||'');}catch{return '';}}
function validEndpoint(raw){const value=String(raw||'').trim();if(!value)return '';let url;try{url=new URL(value);}catch{throw Error('URLが正しくありません。');}if(url.username||url.password||url.search||url.hash||url.pathname.replaceAll('/',''))throw Error('WorkerのベースURLだけを入力してください。');if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error('https://で始まるURLを入力してください。');return url.origin;}
function setStatus(message,kind='normal'){const el=$('#connectionStatus');if(el){el.textContent=message;el.dataset.status=kind;}const badge=$('#judgeBadge');if(badge){badge.innerHTML=`<span class="online-dot"></span>${judgeMode==='ai'?'Gemini AI審判':'ローカル審判'}`;badge.classList.toggle('is-ai',judgeMode==='ai');}}
async function detectMode(){judgeMode='local';if(!apiBase){setStatus('未接続：ローカル審判で遊べます。');return false;}setStatus('AI審判との接続を確認しています…');const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6000);try{const r=await fetch(apiBase+'/api/status',{signal:controller.signal,cache:'no-store'});const data=await r.json();if(!r.ok||!data.ai)throw Error(data.error||'AI審判の設定が完了していません。');judgeMode='ai';setStatus('接続成功：Gemini AI審判を利用できます。','ok');return true;}catch(e){setStatus('接続失敗：'+String(e.message||'ネットワークエラー')+' ローカルで遊べます。','error');return false;}finally{clearTimeout(timer);}}
async function connectWorker(){let url;try{url=validEndpoint($('#workerUrlInput').value);if(!url)throw Error('Worker URLを入力してください。');}catch(e){setStatus(e.message,'error');notify(e.message);return;}apiBase=url;try{localStorage.setItem(AI_KEY,url);}catch{}await detectMode();if(judgeMode==='ai')notify('Gemini AI審判に接続しました ✦');}
async function getJudge(p,e){if(judgeMode!=='ai'||!apiBase)return localJudge(p,e);const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),42000);try{const r=await fetch(apiBase+'/api/judge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({player:{name:p.name,power:p.power},opponent:{name:e.name,power:e.ability,epithet:e.epithet},tier:e.tier}),signal:controller.signal});if(!r.ok){let err=await r.json().catch(()=>({}));throw Error(err.error||`AI判定エラー（${r.status}）`);}const data=await r.json();if(typeof data.won!=='boolean'||!Array.isArray(data.story)||data.story.length<2)throw Error('判定結果が不正です');return {won:data.won,story:data.story.slice(0,4).map(x=>String(x).slice(0,600)),tags:(data.tags||[]).slice(0,4).map(x=>String(x).slice(0,25)),mode:'ai'};}catch(err){notify('AI判定に失敗したためローカル判定に切り替えました');console.warn('AI審判エラー:',err);return localJudge(p,e);}finally{clearTimeout(timeout);}}
async function fight(){if(busy)return;const err=checkPower(state.profile.power);if(err){notify(err);navigate('forge');return;}busy=true;const e=selectedEnemy(),p={...state.profile};currentBattle={enemyId:e.id};$('#battleModal').hidden=false;document.body.style.overflow='hidden';$('#battleLoading').hidden=false;$('#battleResult').hidden=true;$('#battleHeading').textContent='運命の戦い';$('#battleMode').textContent=judgeMode==='ai'?'AI ARENA JUDGEMENT':'LOCAL ARENA JUDGEMENT';$('#battleSub').textContent='能力が交錯する瞬間';$('#modalPlayerName').textContent=p.name;$('#modalEnemyName').textContent=e.name;$('#modalEnemyAvatar').textContent=e.emoji;
 try{const [result]=await Promise.all([getJudge(p,e),new Promise(done=>setTimeout(done,950))]);applyResult(result,e,p);}catch(err){notify('判定を完了できませんでした');$('#battleModal').hidden=true;document.body.style.overflow='';}finally{busy=false;}}
function applyResult(res,e,p){const won=res.won,oldRating=state.rating;const tierBonus={normal:0,hard:5,legend:11}[e.tier];const ratingDelta=won?16+tierBonus+Math.floor(Math.random()*7):-(8+Math.floor(Math.random()*8));const coins=won?20+e.stars*15+Math.floor(Math.random()*12):5+e.stars*2;
 state.rating=Math.max(100,state.rating+ratingDelta);state.peakRating=Math.max(state.peakRating,state.rating);if(won){state.wins++;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);}else{state.losses++;state.streak=0;}state.coins+=coins;state.totalCoins+=coins;
 const date=new Date().toLocaleString('ja-JP',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});state.history.unshift({won,enemyName:e.name,playerName:p.name,playerPower:p.power,mode:res.mode,date,ratingDelta,rating:oldRating,story:res.story});state.history=state.history.slice(0,50);persist();render();
 $('#battleHeading').textContent='審判結果';$('#battleSub').textContent=won?'その言葉が、勝利を掴み取った。':'次の一手で、運命は変わる。';$('#battleMode').textContent=res.mode==='ai'?'AI JUDGEMENT':'LOCAL JUDGEMENT';const banner=$('.result-banner');banner.classList.toggle('loss',!won);$('#resultGlyph').textContent=won?'✦':'✧';$('#resultTitle').textContent=won?'VICTORY':'DEFEAT';$('#resultLine').textContent=won?'あなたの勝利':'挑戦者の勝利';$('#storyBox').replaceChildren(...res.story.map(t=>{const x=document.createElement('p');x.textContent=t;return x;}));$('#scorePills').replaceChildren(...(res.tags||[]).map(t=>{const x=document.createElement('span');x.textContent=t;return x;}));$('#battleReward').innerHTML=`獲得魂晶 <strong>◈ +${coins}</strong> &nbsp; / &nbsp; レート <strong>${ratingDelta>0?'+':''}${ratingDelta}</strong>`;$('#battleLoading').hidden=true;$('#battleResult').hidden=false;}
function closeBattle(){if(busy)return;$('#battleModal').hidden=true;document.body.style.overflow='';}
function init(){render();syncForm();$$('[data-page]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.page)));$('#heroEdit').onclick=()=>navigate('forge');$('#heroAI').onclick=()=>navigate('settings');$('#topSettings').onclick=()=>navigate('settings');$('#howtoSetting').onclick=()=>navigate('settings');$('#workerUrlInput').value=apiBase;$('#connectWorker').onclick=connectWorker;$('#useLocal').onclick=()=>{apiBase='';judgeMode='local';localStorage.removeItem(AI_KEY);$('#workerUrlInput').value='';setStatus('ローカル審判に切り替えました。');notify('ローカル審判を使用します');};$('#goEnemyList').onclick=()=>navigate('enemies');$('#changeOpponent').onclick=()=>navigate('enemies');$('#fightBtn').onclick=fight;$('#saveProfile').onclick=saveProfile;
 for(const sel of ['#nameInput','#titleInput','#powerInput'])$(sel).addEventListener('input',e=>{if(e.target.id==='nameInput'&&nchars(e.target.value)>16)e.target.value=cut(e.target.value,16);if(e.target.id==='titleInput'&&nchars(e.target.value)>24)e.target.value=cut(e.target.value,24);if(e.target.id==='powerInput'&&!e.target.composing&&nchars(e.target.value)>50)e.target.value=cut(e.target.value,50);updatePreview();});
 $('#powerInput').addEventListener('compositionstart',e=>e.target.composing=true);$('#powerInput').addEventListener('compositionend',e=>{e.target.composing=false;if(nchars(e.target.value)>50)e.target.value=cut(e.target.value,50);updatePreview();});
 $('#randomPower').onclick=()=>{$('#powerInput').value=POWER_PRESETS[Math.floor(Math.random()*POWER_PRESETS.length)];updatePreview();notify('能力の候補を生成しました');};
 $('#enemyGrid').addEventListener('click',e=>{const b=e.target.closest('[data-select-enemy]');if(!b)return;state.enemyId=b.dataset.selectEnemy;persist();render();navigate('arena');notify('対戦相手を選択しました');});
 $$('.chip[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;$$('.chip[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderEnemies();}));
 $('#closeBattle').onclick=closeBattle;$('#battleBack').onclick=closeBattle;$('#battleRematch').onclick=async()=>{closeBattle();await fight();};$('#battleModal').addEventListener('click',e=>{if(e.target.id==='battleModal')closeBattle();});window.addEventListener('keydown',e=>{if(e.key==='Escape')closeBattle();});
 $('#clearRecords').onclick=()=>{if(!confirm('戦歴とレート・魂晶をリセットしますか？能力と対戦相手は保持されます。'))return;const profile={...state.profile},enemyId=state.enemyId;state={...structuredClone(initial),profile,enemyId};persist();render();notify('戦歴をリセットしました');};detectMode();}
document.addEventListener('DOMContentLoaded',init);
