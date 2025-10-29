let btn = document.querySelector(".btn")
let surahs = document.querySelector(".surahs")

const playlistItems = document.querySelectorAll(".playlist-item");
const likeBtns = document.querySelectorAll(".like-btn");
const audioPlayer = document.getElementById("audioPlayer");
const volumeRange = document.getElementById("volume-range");
const volum = document.querySelector(".volume i")
const progressBar = document.getElementById("progress-bar");
const playPauseBtn = document.getElementById("playPauseBtn");
const playPauseIcon = document.getElementById("playPauseIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const durate = document.querySelector(".durate")
const cur = document.querySelector(".cur")
const tot = document.querySelector(".total")

let currentSongIndex = 2;
let isSongLoaded = false;

let attr
let fun
let arr1 = []
let count = 0
let c = 0
let state = null
let s =  async function () {
  for (let i = 1 ; i <= 114 ; i++) {
    await axios.get(`https://api.alquran.cloud/v1/surah/${i}/ar.minshawi`)
      .then(response => {
        let name  =  response.data.data.name
        let opt = document.createElement("div")
        opt.className = "surah"
        opt.textContent = name
        surahs.appendChild(opt)
        opt.setAttribute("value",i )
        updateValue(opt)
        allClickOpt(opt)
        arr1.push(opt)

        opt.addEventListener("click", function() {
          count = i - 1;
          voice(opt.getAttribute("value"));   
          putActive2(opt);                    

          // لما تستعدي اوديو هنا احسنر واشرع واسهل واضمن
          const selItem = playlistItems[currentSheikhIndex];
          const selLink = selItem && selItem.getAttribute("link");
          if (selLink) {
            // هيحط اللينك هنا ببعد ما ياخدو من الفويس
            audio(selLink);
            toggle();
          }
        })
      })
  }

  fun = function() {
    return arr1[count + 1]
  }
}
let voices
let songed = false
let l = null
let n = null
let currentSheikhIndex = 0; 

// nextBtn
nextBtn.onclick = () => {
  if (count + 1 < arr1.length) {
    count++;
    prevNext(count);
  } else {
    count = -1;
  }
};

// prevBtn
prevBtn.onclick = () => {
  if (!arr1.length) return;
  if (count > 0) {
    count--;
    prevNext(count);
  } else {
count = 114
  }
};

// shuffleBtn
shuffleBtn.onclick = () => {
  if (!arr1.length) return;
  const randomIndex = Math.floor(Math.random() * arr1.length);
  if (randomIndex !== count) {
    count = randomIndex;
  } else {
    const nextRandomIndex = (randomIndex + 1) % arr1.length;
    count = nextRandomIndex;
  }
  prevNext(count);
};

// voice
function voice(surah) {
  let surahNum = (typeof surah === "object") ? surah.getAttribute("value") : String(surah);
  if (!surahNum) return;

  voices = [
    `https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/${updateValue(surahNum)}.mp3`,
    `https://server10.mp3quran.net/minsh/${updateValue(surahNum)}.mp3`, 
    `https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree/${updateValue(surahNum)}.mp3`, 
    `https://download.quranicaudio.com/quran/abdulbaset_mujawwad/${updateValue(surahNum)}.mp3`, 
    `https://server11.mp3quran.net/yasser/${updateValue(surahNum)}.mp3`, 
    `https://server8.mp3quran.net/afs/${updateValue(surahNum)}.mp3`
  ];

  playlistItems.forEach((item, index) => {
    if (voices[index]) item.setAttribute("link", voices[index]);
  });
}

// playlistItems click
playlistItems.forEach((item, index) => {
  item.addEventListener("click", function() {
    n = this;
    currentSheikhIndex = index; 
    const url = this.getAttribute("link");
    if (url) {
      audio(url);
      toggle();
      l = this;
    } else {
      console.log("اختار سورة أولاً");
    }
  });
});

// prevNext
function prevNext(whatCount) {
  const idx = Number(whatCount);
  if (isNaN(idx) || idx < 0 || idx >= arr1.length) return;

  const surahValue = arr1[idx].getAttribute("value");
  voice(surahValue);

  putActive2(arr1[idx]);  

  updatePlayPauseIcon(true);

  const selItem = playlistItems[currentSheikhIndex];
  const selLink = selItem && selItem.getAttribute("link");
  if (selLink) {
    audio(selLink);
    toggle();
  }
}

// allClickOpt : when i click on element 
function allClickOpt(all) {
  all.addEventListener("click", function () {
    putActive2(all)
    playPauseBtn.click()
  })
}

// putActive2 : to put border in active class
function putActive2(active2) {
  if (state) {
    state.classList.remove("active2")
  }
  if (active2) {
    active2.classList.add("active2")
    state = active2
  }
}

// audio
let r = new Audio
function audio(value){
  r.src = `${value}`
  checkPlayPause()

  const initialIsUrl = /^https?:\/\//i.test(String(value));
  r.removeEventListener("ended", r._endedHandlerTemp);

  r._endedHandlerTemp = function() {
    if (initialIsUrl) {
      const nextElem = fun(); // جلب العنصر التالي
      if (!nextElem) return; // حماية لو وصلنا للنهاية

      voice(nextElem); // تحديث روابط الصوت لكل شيخ

      // تحديث رابط الصوت باستخدام العنصر النشط الحالي لكل شيخ
      const selItem = playlistItems[currentSheikhIndex];
      const selLink = selItem.getAttribute("link"); 
      if (selLink) {
        r.src = selLink;
      }

      putActive2(nextElem); // تحديث العنصر النشط
      r.play();
      updatePlayPauseIcon(true);

      // تحديث المتغيرات ليصبح العنصر الحالي هو nextElem
      n = nextElem;
      count = arr1.indexOf(nextElem); 
    } else {
      let num = Number(value);
      if (isNaN(num)) return;
      num++;
      let sVal = String(num).padStart(3,"0");
      r.src = voices[n.getAttribute("index")]; // يجب التأكد أن n موجود
      putActive2(fun())
      r.play()
      updatePlayPauseIcon(true)
    }
  };

  r.addEventListener("ended", r._endedHandlerTemp);

  volume(r)
  barAudio(r)
}


// updateValue
function updateValue(optOrValue){
  let value = optOrValue;
  if (!value && value !== 0) return null;
  if (typeof value === "object" && value.getAttribute) {
    value = value.getAttribute("value");
  }
  value = String(value);
  return value.padStart(3,"0");
}

// toggle
function toggle() {
  if (r.paused) {
    r.play().then(() => updatePlayPauseIcon(true))
             .catch(() => updatePlayPauseIcon(false));
  } else {
    r.pause();
    updatePlayPauseIcon(false);
  }
}

// checkPlayPause
function checkPlayPause() {
  playPauseBtn.removeEventListener("click",toggle )
  playPauseBtn.addEventListener("click",toggle )
}

// updatePlayPauseIcon
function updatePlayPauseIcon(isPlaying) {
  if (isPlaying) {
    playPauseIcon.classList.add("fa-pause");
    playPauseIcon.classList.remove("fa-play");
  } else {
    playPauseIcon.classList.add("fa-play");
    playPauseIcon.classList.remove("fa-pause");
  }
}

// volume
async function volume(vol) {
  volumeRange.addEventListener("input", function () {
    let val = volumeRange.value / 100 
    vol.volume = val
    checkRangeAudio(val)
  })
  clickXH_mark(vol)
}

// clickXH_mark
function clickXH_mark(volee) {
  volum.addEventListener("click", function() {
    if (volee.volume > 0 ) {
      volumeRange.value = 0.0
      volee.volume = 0
      volum.classList.add("fa-volume-xmark")
      volum.classList.remove("fa-volume-high")
    } else {
      volumeRange.value = 50
      volee.volume = 0.50
      volum.classList.add("fa-volume-high")
      volum.classList.remove("fa-volume-xmark")
    }
  })
}

// checkRangeAudio
function checkRangeAudio(val) {
  if (val <= 0.3 && val !== 0) {
    volum.classList.remove("fa-volume-high")
    volum.classList.add("fa-volume-low")
    volum.classList.remove("fa-volume-xmark")
  } else if (val >= 0.3 && val !== 0 ){
    volum.classList.remove("fa-volume-low")
    volum.classList.add("fa-volume-high")
    volum.classList.remove("fa-volume-xmark")
  } else if (val === 0){
    volum.classList.add("fa-volume-xmark")
  }
}

// barAudio
function barAudio(lineAudio) {
  lineAudio.addEventListener("loadedmetadata", () => {
    let total = lineAudio.duration;
    progressBar.max = total
    tot.textContent = formatTime(total)
  });
  lineAudio.addEventListener("timeupdate", () => {
    let current = Math.floor(lineAudio.currentTime)
    progressBar.value = current
    cur.textContent = formatTime(current) 
  });
  progressBar.addEventListener("input", () => {
    lineAudio.currentTime = progressBar.value;
  });
}

// formatTime
function formatTime(seconds) {
  let hours   = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let sec     = Math.floor(seconds % 60);
  if (minutes < 10 && hours > 0) minutes = "0" + minutes;
  if (sec < 10) sec = "0" + sec;
  return hours > 0 
         ? `${hours}:${minutes}:${sec}` 
         : `${minutes}:${sec}`;
}

s()

// swiper
var swiper = new Swiper(".swiper", {
  effect: "cards",
  cardsEffect: {
    perSlideOffset: 9,
    perSlideRotate: 3,
  },
  grabCursor: true,
  speed: 900,
  initialSlide: 0,
});

playlistItems.forEach((item) => {
  item.addEventListener("click", function () {
    let index = item.getAttribute("index"); 
    swiper.slideTo(index, 800);
  });
});

swiper.on("slideChange", () => {
  const newIndex = swiper.realIndex;
  if (newIndex !== currentSongIndex) {
    currentSongIndex = newIndex;
    updatePlayPauseIcon(true);
  }
});

function updateSwiperToMatchSong(index) {
  if (swiper.activeIndex !== index) {
    swiper.slideTo(index);
  }
}

likeBtns.forEach(item => {
  item.addEventListener("click", function () {
    if(item.classList[0] === "fa-regular") {
      console.log("done")
item.classList.replace("fa-regular", "fa-solid");
    } else item.classList.replace("fa-solid", "fa-regular");
    console.log()
  })
})