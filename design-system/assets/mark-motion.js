// Mode 5 - leaf drift: one leaf rustles every 12-25s. Call lfLeafDrift(svgEl); returns stop().
(function(){
  window.lfLeafDrift=function(svg){
    if(!svg||matchMedia('(prefers-reduced-motion: reduce)').matches) return function(){};
    var timer;
    function tick(){
      var leaves=svg.querySelectorAll('.mark-leaf');
      if(leaves.length){
        var leaf=leaves[Math.floor(Math.random()*leaves.length)];
        leaf.classList.add('lf-leaf-rustle');
        setTimeout(function(){leaf.classList.remove('lf-leaf-rustle');},1500);
      }
      timer=setTimeout(tick,12000+Math.random()*13000);
    }
    timer=setTimeout(tick,12000+Math.random()*13000);
    return function(){clearTimeout(timer);};
  };
})();