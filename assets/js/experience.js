(() => {
  'use strict';
  const canvas = document.getElementById('experience-canvas');
  const ctx = canvas?.getContext?.('2d', { alpha: true });
  if (!ctx) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const names = ['arrival', 'perception', 'practice', 'work', 'contact'];
  const clamp = (v, low = 0, high = 1) => Math.max(low, Math.min(high, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  const colors = [[154, 116, 58], [111, 140, 151], [51, 94, 148]];
  const poses = [
    { x:.785, y:.48, size:.37, rx:.11, ry:-.67, rz:.07, depth:.85, opening:.13, spread:0, opacity:1, warmth:0 },
    { x:.735, y:.51, size:.255, rx:0, ry:0, rz:0, depth:0, opening:1, spread:0, opacity:1, warmth:0 },
    { x:.26, y:.56, size:.32, rx:1.10, ry:-.40, rz:.17, depth:.95, opening:.58, spread:1, opacity:.55, warmth:.05 },
    { x:.80, y:.23, size:.28, rx:.14, ry:.10, rz:0, depth:.1, opening:1, spread:0, opacity:.08, warmth:0 },
    { x:.77, y:.52, size:.34, rx:.08, ry:-.34, rz:-.05, depth:.62, opening:1.15, spread:0, opacity:.86, warmth:.55 }
  ];
  const phone = [
    [.90,.355,.255,.47], [.5,.698,.143,.93], [.78,.28,.26,.14], [.87,.24,.26,.03], [.86,.36,.28,.35]
  ];
  poses.forEach(pose => {pose.aspectX=1;pose.aspectY=1;});
  const projectWindows = [...document.querySelectorAll('.project-preview')];
  let width = innerWidth, height = innerHeight, mobile = width < 760;
  let anchors = [], current = {...poses[0]}, target = {...poses[0]};
  let frame = 0, last = 0, introStart = null, painted = false;
  let intro = !reduced.matches && !root.classList.contains('motion-paused') && scrollY < 50 && !location.hash ? 0 : 1;
  const pointer = { x:0, y:0, tx:0, ty:0 };
  const emphasis = [0,0,0];
  let selectedLayer = -1;
  const canMove = () => !document.hidden && !reduced.matches && !root.classList.contains('motion-paused');
  const rgba = (color, alpha) => `rgba(${color.join(',')},${alpha})`;
  const tint = i => colors[i].map((value, channel) => Math.round(mix(value, colors[0][channel], current.warmth)));

  function poseAt(index) {
    const pose = {...poses[index]};
    if (mobile) [pose.x, pose.y, pose.size, pose.opacity] = phone[index];
    if (index === 3 && projectWindows.length) {
      const boxes=projectWindows.map(el=>el.getBoundingClientRect());
      const box=boxes.reduce((best,rect)=>Math.abs(rect.top+rect.height*.5-height*.55)<Math.abs(best.top+best.height*.5-height*.55)?rect:best);
      const scale=Math.min(height*pose.size,width*(mobile?.78:.33));
      const margin=mobile?9:17;
      pose.x=(box.left+box.width*.5)/width;pose.y=(box.top+box.height*.5)/height;
      pose.aspectX=(box.width*.5+margin)/(scale*.90);pose.aspectY=(box.height*.5+margin)/(scale*1.03);
      pose.rx=pose.ry=pose.rz=pose.depth=0;pose.opening=3.05;pose.opacity=mobile?.55:.88;
    }
    return pose;
  }
  function measure() {
    anchors = names.map(name => {
      const el = document.querySelector(`section[data-scene="${name}"]`);
      return Math.max(0, el.getBoundingClientRect().top + scrollY);
    });
  }
  function readTarget() {
    // The camera holds each scene. It changes frames only while crossing a boundary.
    // A long section does not stretch a transition or leave the art between meanings.
    let index = 0;
    while (index < names.length - 1 && scrollY >= anchors[index + 1] - height * .66) index++;
    if (!index) { target = poseAt(0); return; }
    const start = anchors[index] - height * .66;
    const end = anchors[index] + Math.min(height * .10, 70);
    const t = ease(clamp((scrollY - start) / (end - start)));
    const a = poseAt(index - 1), b = poseAt(index);
    Object.keys(a).forEach(key => target[key] = mix(a[key], b[key], t));
  }
  function project(x, y, z, pose = current) {
    const ry = pose.ry + pointer.x * .025 + (1-intro) * -.08;
    const rx = pose.rx + pointer.y * .018;
    [x,z] = [x*Math.cos(ry)+z*Math.sin(ry), z*Math.cos(ry)-x*Math.sin(ry)];
    [y,z] = [y*Math.cos(rx)-z*Math.sin(rx), z*Math.cos(rx)+y*Math.sin(rx)];
    [x,y] = [x*Math.cos(pose.rz)-y*Math.sin(pose.rz), y*Math.cos(pose.rz)+x*Math.sin(pose.rz)];
    const size = Math.min(height*pose.size, width*(mobile ? .78 : .33));
    const perspective = 5/(5-z);
    return {x:width*pose.x+x*size*perspective, y:height*pose.y+y*size*perspective, z};
  }
  function trace(points, close = false) {
    ctx.beginPath();
    points.forEach((p,index) => index ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
    if(close) ctx.closePath();
  }
  function stroke(points, color, opacity, weight = 1) {
    trace(points); ctx.lineWidth=weight; ctx.strokeStyle=rgba(color,opacity); ctx.stroke();
  }
  function contour(angle, radius, layer, ridge = 0) {
    // Superelliptic aperture: a soft architectural rectangle, cut from layered glass.
    const cosine = Math.cos(angle), sine = Math.sin(angle);
    const exponent = .24;
    const shapedX = Math.sign(cosine)*Math.pow(Math.abs(cosine), exponent);
    const shapedY = Math.sign(sine)*Math.pow(Math.abs(sine), exponent);
    const inner = .39 + current.opening * .17;
    const scale = mix(inner, 1, radius);
    const ripple = Math.sin(angle*2 + layer*.46) * .022 * Math.sin(radius*Math.PI) * current.depth;
    let x = shapedX*(scale+ripple)*.90*current.aspectX;
    let y = shapedY*(scale+ripple)*1.03*current.aspectY;
    const offset = (layer-1)*current.depth;
    const outerLift = Math.pow(radius,2) * Math.sin(angle + layer*.55) * .055 * current.depth;
    let z = offset + outerLift + ridge;
    x += (layer-1)*current.spread*.19;
    y += (layer-1)*current.spread*.15;
    return project(x,y,z);
  }
  function pathContour(radius, layer, start = 0, end = Math.PI*2, ridge = 0) {
    const count = mobile ? 100 : 144;
    return Array.from({length:count+1}, (_,index) => contour(mix(start,end,index/count), radius, layer, ridge));
  }
  function paintPlane(layer) {
    const opacity = current.opacity * (.65+intro*.35) * (1 + emphasis[layer]*.65);
    const color = tint(layer);
    const outer = pathContour(1,layer);
    const inner = pathContour(0,layer).reverse();
    // Transparent optical material. Only the edges carry saturated color.
    trace(outer,true); const skin = ctx.createLinearGradient(outer[0].x,outer[0].y,outer[50].x,outer[50].y);
    skin.addColorStop(0,rgba(color,opacity*.022));
    skin.addColorStop(.54,rgba(color,opacity*.045));
    skin.addColorStop(1,rgba(color,opacity*.085));
    inner.forEach((p,index) => index ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
    ctx.closePath(); ctx.fillStyle=skin; ctx.fill('evenodd');
    const count = mobile ? 16 : 24;
    for(let line=0; line<=count; line++) {
      const r=line/count;
      const rim = line===0 || line===count;
      // Fine engraved traces take a different course on each plane.
      // As the viewing angle closes, their optical overlaps produce one field.
      const beginning = -Math.PI*.5 + layer*Math.PI*2/3;
      const paths = pathContour(r,layer, beginning, beginning+Math.PI*2/3);
      stroke(paths,color,opacity*(rim?.72:.13+.22*Math.pow(Math.sin(r*Math.PI),2)),rim?1.1:.65);
    }
    stroke(pathContour(.01,layer), color, opacity*.13,.7);
    stroke(pathContour(1,layer), color, opacity*.19,.7);
    stroke(pathContour(.99,layer,Math.PI*.8,Math.PI*1.72),color,opacity*.16,4.5);
    // Micro edges provide a restrained bevel without a blurred neon glow.
    stroke(pathContour(.998,layer,Math.PI*1.06,Math.PI*1.62,.008),[255,255,255],opacity*.87,1.6);
    const nodes = [.2,.71,1.24,1.78].map(v=>contour(v*Math.PI,.58,layer));
    for(const p of nodes){ ctx.beginPath(); ctx.arc(p.x,p.y,1.7,0,Math.PI*2);ctx.fillStyle=rgba(color,opacity*.8);ctx.fill(); }
  }
  function paintConnections() {
    const opacity = current.opacity;
    const color = tint(1);
    for(let corner=0;corner<4;corner++) {
      const angle=Math.PI*.25+corner*Math.PI*.5;
      const points=[];
      for(let layer=0;layer<3;layer++) points.push(contour(angle,.54,layer));
      stroke(points,color,opacity*.17, .75);
      for(const p of [points[0], points[2]]) {
        ctx.beginPath();ctx.arc(p.x,p.y,2.4,0,Math.PI*2);ctx.fillStyle=rgba([247,246,241],opacity);ctx.fill();ctx.strokeStyle=rgba(color,opacity*.52);ctx.lineWidth=.7;ctx.stroke();
      }
    }
    // Each slide contains only one third of the route. The viewing angle is the
    // missing relationship: at the whole view, endpoints coincide exactly.
    const segments = [];
    const route = t => ({x:(t-.5)*1.06,y:(Math.cos(t*Math.PI*2)*.11)});
    for(let layer=0;layer<3;layer++) {
      const points=[];
      for(let n=0;n<=45;n++) {
        const t=(layer+n/45)/3;
        const p=route(t);
        points.push(project(p.x,p.y,(layer-1)*current.depth));
      }
      const strength=opacity*.85;
      stroke(points,tint(layer),strength*.12,5);
      stroke(points,tint(layer),strength,1.25);
      for(const p of [points[0],points.at(-1)]) {
        ctx.beginPath();ctx.arc(p.x,p.y,2.7,0,Math.PI*2);ctx.fillStyle=rgba([247,246,241],strength);ctx.fill();
        ctx.lineWidth=1;ctx.strokeStyle=rgba(tint(layer),strength);ctx.stroke();
      }
      segments.push(points);
    }
    if(current.depth>.025) {
      ctx.setLineDash([2,5]);
      for(let layer=0;layer<2;layer++)stroke([segments[layer].at(-1),segments[layer+1][0]],tint(1),opacity*Math.min(current.depth,.8)*.24,.65);
      ctx.setLineDash([]);
    }
  }

  function paint() {
    ctx.clearRect(0,0,width,height);
    ctx.lineCap='round';ctx.lineJoin='round';
    const ordered=[0,1,2].sort((a,b)=>contour(0,.5,a).z-contour(0,.5,b).z);
    // Depth-sorted planes make the same apertures legible as detail and as one system.
    ordered.forEach(paintPlane);
    paintConnections();
    const fade = ctx.createLinearGradient(0,0,width*(mobile?.57:.50),0);
    const shielding = current.x < .5 ? .25 : 1;
    fade.addColorStop(0,`rgba(0,0,0,${.98*shielding})`);fade.addColorStop(.65,`rgba(0,0,0,${.7*shielding})`);fade.addColorStop(1,'rgba(0,0,0,0)');
    if(!mobile || current.y < .58) {
      ctx.globalCompositeOperation='destination-out';ctx.fillStyle=fade;ctx.fillRect(0,0,width,height);ctx.globalCompositeOperation='source-over';
    }
    const headerFade = ctx.createLinearGradient(0,0,0,mobile?100:145);
    headerFade.addColorStop(0,'rgba(0,0,0,.88)');headerFade.addColorStop(1,'rgba(0,0,0,0)');
    ctx.globalCompositeOperation='destination-out';ctx.fillStyle=headerFade;ctx.fillRect(0,0,width,mobile?100:145);ctx.globalCompositeOperation='source-over';
    if(!painted){painted=true;root.classList.add('experience-ready');}
  }
  function settle() {
    if(frame) cancelAnimationFrame(frame);
    frame=0;last=0;intro=1;current={...target};pointer.x=pointer.y=pointer.tx=pointer.ty=0;
    if(!document.hidden)paint();
  }
  function tick(time) {
    frame=0;
    if(!canMove()){settle();return;}
    const dt=last?Math.min(50,time-last):16;
    last=time;const fraction=1-Math.exp(-dt/105);let moving=false;
    Object.keys(current).forEach(key=>{
      const delta=target[key]-current[key];
      if(Math.abs(delta)>.00018){current[key]+=delta*fraction;moving=true;}else current[key]=target[key];
    });
    emphasis.forEach((value,index)=>{
      const goal = index===selectedLayer?1:0;
      if(Math.abs(goal-value)>.002){emphasis[index]+= (goal-value)*fraction;moving=true;}else emphasis[index]=goal;
    });
    ['x','y'].forEach(key=>{
      const delta=pointer['t'+key]-pointer[key];
      if(Math.abs(delta)>.001){pointer[key]+=delta*fraction;moving=true;}else pointer[key]=pointer['t'+key];
    });
    if(intro<1){if(introStart===null)introStart=time;intro=ease(clamp((time-introStart)/1400));moving ||= intro<1;}
    paint();
    if(moving)frame=requestAnimationFrame(tick);else last=0;
  }
  function request(){if(canMove()&&!frame)frame=requestAnimationFrame(tick);}
  function resize(){
    width=innerWidth;height=innerHeight;mobile=width<760;
    const dpr=Math.min(devicePixelRatio||1,mobile?1.75:1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    measure();readTarget();current={...target};paint();request();
  }
  addEventListener('scroll',()=>{readTarget();request();},{passive:true});
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',event=>{if(!fine.matches||!canMove()||event.pointerType==='touch')return;pointer.tx=(event.clientX/width-.5)*2;pointer.ty=(event.clientY/height-.5)*2;request();},{passive:true});
  document.addEventListener('pointerleave',()=>{pointer.tx=pointer.ty=0;request();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();else{readTarget();canMove()?request():settle();}});
  function motion(){
    // Motion preferences also change sticky layout and section heights.
    // Rebind the optical window before it is made visible again.
    measure();readTarget();
    if(canMove()){current={...target};paint();request();}else settle();
  }
  reduced.addEventListener?.('change',motion);
  new MutationObserver(records=>{
    const paused=root.classList.contains('motion-paused');
    if(records.some(record=>(' '+(record.oldValue||'')+' ').includes(' motion-paused ')!==paused))motion();
  }).observe(root,{attributes:true,attributeFilter:['class'],attributeOldValue:true});
  const rows = [...document.querySelectorAll('.index-row')];
  const layers = [0,1,2,2,1,0,2];
  const selectLayer = index => { if(!canMove())return;selectedLayer=index;request(); };
  rows.forEach((row,index)=>{
    row.addEventListener('pointerenter',event=>{if(fine.matches&&event.pointerType!=='touch')selectLayer(layers[index]);});
    row.addEventListener('pointerleave',()=>{if(!row.contains(document.activeElement))selectLayer(-1);});
    row.addEventListener('focusin',()=>selectLayer(layers[index]));
    row.addEventListener('focusout',event=>{if(!row.contains(event.relatedTarget))selectLayer(-1);});
  });
  window.grokExperience={refresh:resize};
  resize();document.fonts?.ready.then(()=>{measure();readTarget();canMove()?request():settle();});
})();
