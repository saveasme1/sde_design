document.addEventListener("DOMContentLoaded", function(){

  const root = document.querySelector("#zeron_slider");
  if(!root) return;

  const viewport = root.querySelector(".zs_viewport");
  const track = root.querySelector(".zs_track");
  // 원본 슬라이드(HTML에 들어있는 슬라이드들). 이미지만 바꾸면 자동 반영됩니다.
  const originalSlides = Array.from(root.querySelectorAll(".zs_slide"));
  const pagingCurrent = root.querySelector(".zs_paging_current");
  const pagingTotal = root.querySelector(".zs_paging_total");
  const pagingPrev = root.querySelector(".zs_paging_prev");
  const pagingNext = root.querySelector(".zs_paging_next");

  /**
   * 무한 루프(첫/마지막에서 반대편 슬라이드가 옆에 보이게)
   * - track 앞: 마지막 슬라이드 복제본(prepend)
   * - track 뒤: 첫 슬라이드 복제본(append)
   * - 내부 index: 0..realCount+1 (0=마지막 복제, realCount+1=첫 복제)
   * - 화면 표시(페이지네이션/도트): 1..realCount
   */
  const realCount = originalSlides.length;
  if(realCount === 0) return;

  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[realCount - 1].cloneNode(true);
  firstClone.classList.add("is-clone");
  lastClone.classList.add("is-clone");
  track.insertBefore(lastClone, originalSlides[0]);
  track.appendChild(firstClone);

  const slides = Array.from(track.querySelectorAll(".zs_slide")); // 복제 포함
  let index = 1; // 첫 실제 슬라이드
  let autoplayTimer = null;
  let isDragging = false;
  let startX = 0;
  let startTranslate = 0;
  let lastTranslate = 0;

  const autoplayMs = 3500;
  const swipeThresholdRatio = 0.12; // 뷰포트 폭의 12% 이상이면 넘김

  function getGapPx(){
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0");
    return Number.isFinite(gap) ? gap : 0;
  }

  function getSlideWidthPx(){
    // 중요: 슬라이드에 scale(transform)이 적용되면 getBoundingClientRect 폭이 바뀌어서
    // 중앙 정렬이 "흔들리는" 문제가 생깁니다. 레이아웃 폭(offsetWidth)으로 고정합니다.
    return slides[0]?.offsetWidth || 0;
  }

  function clampIndex(i){
    const len = slides.length;
    return ((i % len) + len) % len;
  }

  function toRealIndex(internalIndex){
    // internal 1..realCount => real 0..realCount-1
    if(internalIndex === 0) return realCount - 1;
    if(internalIndex === realCount + 1) return 0;
    return internalIndex - 1;
  }

  function setActiveClasses(){
    slides.forEach((s)=> {
      s.classList.remove("is-active", "is-prev", "is-next");
    });

    const prev = clampIndex(index - 1);
    const next = clampIndex(index + 1);

    slides[index]?.classList.add("is-active");
    slides[prev]?.classList.add("is-prev");
    slides[next]?.classList.add("is-next");
  }

  function updatePaging(){
    if(pagingTotal) pagingTotal.textContent = String(realCount);
    if(pagingCurrent) pagingCurrent.textContent = String(toRealIndex(index) + 1);
  }

  function computeTranslateForIndex(i){
    /**
     * 완전 정중앙 고정 방식
     * - 계산식(폭/갭)으로 추정하지 않고,
     * - "활성 슬라이드의 중심점"을 "뷰포트 중심점"에 정확히 맞춥니다.
     * 이렇게 하면 좌/우 노출 비율이 흔들리지 않습니다.
     */
    const target = slides[i];
    if(!target) return 0;

    const vpStyles = window.getComputedStyle(viewport);
    const paddingLeft = parseFloat(vpStyles.paddingLeft || "0") || 0;

    const viewportCenter = viewport.clientWidth / 2;
    const slideCenter = paddingLeft + target.offsetLeft + (target.offsetWidth / 2);
    return viewportCenter - slideCenter;
  }

  function applyTranslate(x, withTransition){
    if(withTransition){
      track.style.transition = "";
    }else{
      track.style.transition = "none";
    }
    track.style.transform = `translate3d(${x}px,0,0)`;
    lastTranslate = x;
  }

  function goTo(i, fromUser){
    index = clampIndex(i);
    setActiveClasses();
    updatePaging();
    const x = computeTranslateForIndex(index);
    applyTranslate(x, true);

    if(fromUser){
      restartAutoplay();
    }
  }

  function next(){
    goTo(index + 1, false);
  }

  function stopAutoplay(){
    if(autoplayTimer){
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay(){
    stopAutoplay();
    autoplayTimer = setInterval(next, autoplayMs);
  }

  function restartAutoplay(){
    stopAutoplay();
    autoplayTimer = setInterval(next, autoplayMs);
  }

  function onPointerDown(e){
    if(!viewport) return;
    isDragging = true;
    startX = e.clientX;
    startTranslate = lastTranslate;
    viewport.setPointerCapture?.(e.pointerId);
    stopAutoplay();
    track.style.transition = "none";
  }

  function onPointerMove(e){
    if(!isDragging) return;
    const dx = e.clientX - startX;
    applyTranslate(startTranslate + dx, false);
  }

  function onPointerUp(e){
    if(!isDragging) return;
    isDragging = false;
    const dx = e.clientX - startX;
    const vw = viewport.getBoundingClientRect().width;
    const threshold = vw * swipeThresholdRatio;

    if(dx > threshold){
      goTo(index - 1, true);
    }else if(dx < -threshold){
      goTo(index + 1, true);
    }else{
      goTo(index, true);
    }
  }

  // init
  updatePaging();
  setActiveClasses();
  goTo(1, false); // 첫 실제 슬라이드로 시작
  startAutoplay();

  // 트랜지션이 끝나면 복제 슬라이드에서 실제 슬라이드로 "순간 이동" (끊김 없이 무한 루프)
  track.addEventListener("transitionend", (e)=>{
    if(e.propertyName !== "transform") return;

    if(index === 0){
      index = realCount; // 마지막 실제
      setActiveClasses();
      updatePaging();
      applyTranslate(computeTranslateForIndex(index), false);
    }else if(index === realCount + 1){
      index = 1; // 첫 실제
      setActiveClasses();
      updatePaging();
      applyTranslate(computeTranslateForIndex(index), false);
    }
  });

  // 숫자 페이지네이션 옆 "다음(>)" 버튼
  if(pagingNext){
    pagingNext.addEventListener("click", ()=>{
      goTo(index + 1, true);
    });
  }

  // 숫자 페이지네이션 옆 "이전(<)" 버튼
  if(pagingPrev){
    pagingPrev.addEventListener("click", ()=>{
      goTo(index - 1, true);
    });
  }

  // pointer events (모바일/PC 드래그)
  if(viewport){
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
  }

  // resize 대응
  window.addEventListener("resize", ()=>{
    goTo(index, false);
  });

});