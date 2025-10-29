// get the immediate time
// get the azan times
//  minus immediate time from azan times
/*
--- 
-- should azan time larger than immediate time
-- and the resylt shoul be positive
-- if not  add 24 from results of the last operation
*/
/// hold element 


// fetch for nav bar


const all_azan = document.querySelector(".all-azan")
const container = document.getElementById('countdownContainer');
const lead = document.getElementById("lead")
let results = document.getElementById("results");

let stars = document.querySelector(".stars")
let moon = document.querySelector(".moon")
let pr = document.querySelector(".pr")
/// start moon style
window.onscroll = function() {
  let value = scrollY
  console.log(value)
  stars.style.left = value + "px"
  moon.style.top = value   + "px"
  pr.style.fontSize = value / 10.7  + "px"
  pr.style.top = value   + "px"
  if (value >=66){

    moon.style.setProperty('--moon-right', value / 3.2 +  "px");
  } else {
    moon.style.setProperty('--moon-right', 25);
  }
if (value >= 520) {
  document.body.style.background =  "linear-gradient(310deg, #0f0d0d, #1c2185)"
}else  {
  document.body.style.background = "linear-gradient(60deg, #350a31, #0c030c)"
}
  // moon.style.width = value + "px"
}
/// end moon style

//  get current data
const getTime = () => {
  let d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()];
};

let [currentH, currentM, currentS] = getTime();



// start get and convert city and country

// error validate
function error() { 
            Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "please enter a valid city and country",
            footer: '<a href="#">Why do I have this issue?</a>'
        }); 
}

function getCoordinates(city, country) {
  return axios
    .get(
      `https://nominatim.openstreetmap.org/search?city=${city}&country=${country}&format=json`
    )
    .then((response) => {
      let data = response.data;
      let lat = data[0].lat;
      let lon = data[0].lon;
      return { lat, lon };
    });
}


document.getElementById("city").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("country").focus()
  }
})

document.getElementById("country").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("getTime").click()
  }
})

document.getElementById("getTime").addEventListener("click", function () {
  getvalues();
});





function getvalues() {
let city = document.getElementById("city").value;
let country = document.getElementById("country").value;

    if (city.trim() !== "" || country.trim() !== "") {
    getCoordinates(city, country)
    .then((coords) => {
        let lat = coords.lat;
        let lon = coords.lon;
        return getAzan(lat, lon);
    })
        .catch((el) => {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "please enter a valid city and country",
            footer: '<a href="#">Why do I have this issue?</a>',
    });
    });
    } else {
    error();
    }
    }
 // conavetrt lat and lin to azan time

 function getAzan(l, n) {
lead.innerHTML = ""
container.innerHTML= ""
  axios
    .get(
      `https://api.aladhan.com/v1/timings?latitude=${l}&longitude=${n}&method=5`
    )
    .then((response) => {
    let data = response.data.data.timings;
    let fajr = data.Fajr;
    let sunrise = data.Sunrise;
    let dhuhr = data.Dhuhr;
    let asr = data.Asr;
    let maghrib = data.Maghrib;
    let isha = data.Isha;
    let all = { 
      "الفجر" :  data.Fajr,
      "الشروق": data.Sunrise,
      "الظهر": data.Dhuhr,
      "العصر": data.Asr,
      "المغرب":data.Maghrib,
      "العشاء": data.Isha };

for (let key in all) {
    let p = document.createElement("p");
    let span = document.createElement("span");
    span.textContent = ` ${key} `;
    p.className = "azan-times";
    p.textContent = all[key] + " : ";
    lead.appendChild(p);
    p.appendChild(span);

    // استدعاء العد التنازلي
    calcAll(all[key]);
}

        return all;
    });
    }
// get prayer time by Your location
  navigator.geolocation.getCurrentPosition(
  position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    console.log("User location:", lat, lon);
 axios
    .get(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=5`
    ).then
    ( res => {
      getAzan(lat,lon)
      }
    )

  },
  error => {
    console.error("Error getting location:", error.message);
  }
);

// end convert
// start countdown
// hold element 
let hour =document.querySelector(".hours")
let mins =document.querySelector(".mins")
let seconds =document.querySelector(".seconds")

//cs   calcM
// calulate the azan minut - currwntment

function calcAll(azanH) {

    const countdownDiv = document.createElement('div');
    countdownDiv.className = 'countdown';

    const tilesDiv = document.createElement('div');
    tilesDiv.className = 'tiles';

    const hoursSpan = document.createElement('span');
    hoursSpan.className = 'hours';
    tilesDiv.appendChild(hoursSpan);

    const minsSpan = document.createElement('span');
    minsSpan.className = 'mins';
    tilesDiv.appendChild(minsSpan);

    const secsSpan = document.createElement('span');
    secsSpan.className = 'seconds';
    tilesDiv.appendChild(secsSpan);

    const labelsDiv = document.createElement('div');
    labelsDiv.className = 'labels';
    ['Hours', 'Mins', 'Secs'].forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        labelsDiv.appendChild(li);
    });

    countdownDiv.appendChild(tilesDiv);
    countdownDiv.appendChild(labelsDiv);
    container.appendChild(countdownDiv);

    // تحويل وقت الأذان إلى Date
    let [azanHour, azanMin] = azanH.split(":").map(Number);
    let azanDate = new Date();
    azanDate.setHours(azanHour, azanMin, 0, 0);
    if (azanDate < new Date()) azanDate.setDate(azanDate.getDate() + 1);

    // setInterval واحد لكل صلاة يعتمد على الوقت الحقيقي
    const interval = setInterval(() => {
        let now = new Date();
        let diff = azanDate - now; // بالميلي ثانية

        if (diff <= 0) {
            hoursSpan.textContent = 0;
            minsSpan.textContent = 0;
            secsSpan.textContent = 0;

            // تشغيل الأذان
            let audio = new Audio("./audios/mm.mp3");
            document.addEventListener("click", function () {
                          audio.play();

            })
 
            Swal.fire({
                title: "🤲🌙🕌 موعد الصلاة !",
                confirmButtonText: "تمام هروح أصلي",
                confirmButtonColor: "rgb(211, 163, 94)"
            });

            clearInterval(interval);
            return;
        }

        let hours = Math.floor(diff / 1000 / 60 / 60);
        let minutes = Math.floor((diff / 1000 / 60) % 60);
        let seconds = Math.floor((diff / 1000) % 60);

        hoursSpan.textContent = hours;
        minsSpan.textContent = minutes;
        secsSpan.textContent = seconds;

    }, 1000);
}

// start dakr count


 let dakr = document.querySelectorAll(".dak");
        let arrDakr = [];
        let cont = 0;
        
        dakr.forEach((el, index) => {
            arrDakr.push(el);
            el.addEventListener("click", function () {
                playClickSound();
                cont = index;
                removeAc();
                el.style.transform = 'scale(0.95)';
                setTimeout(() => el.style.transform = '', 150);
            });
        });

        let step = 0;
        let arc = 0.7;
        const circle = document.getElementById('circle');
        circle.style.background = `conic-gradient(#00ff88 0deg, #1a1a1a ${arc}deg)`;
        let inc = 1;
        const maxSteps = 33;

        function increaseArc() {
            playClickSound();
            inc = 1;
            step += 1;
            
            if (step > maxSteps) {
                // Complete animation
                circle.classList.add('complete');
                setTimeout(() => circle.classList.remove('complete'), 600);
                
                if (cont < 4) {
                    cont += 1;
                    removeAc();
                } else {
                    cont = 0;
                    arrDakr[cont].classList.add("active2");
                }
                step = 1;
            }
            
            calcArc("#00ff88");
            create("floating-number", "+", step);
        }

        function decreaseArc() {
            playClickSound();
            inc = 1;
            step -= 1;
            
            if (step < 0) {
                step = 0;
                return;
            }
            
            calcArc("#ffd700");
            create("floating-number-minus", "-", step);
        }

        function removeAc() {
            arrDakr.forEach(ele => {
                ele.classList.remove("active2");
                ele.style.transform = '';
            });
            arrDakr[cont].classList.add("active2");
        }

        function reset() {
            playResetSound();
            inc = step;
            arc = step - 1;
            circle.style.background = `conic-gradient(#00ff88 0deg, #1a1a1a 0.6deg)`;
            create("floating-number-minus", "↻", 0);
            step = 0;
            
            // Reset animation
            circle.style.transform = 'rotate(-90deg) scale(0.9)';
            setTimeout(() => circle.style.transform = 'rotate(-90deg) scale(1)', 200);
        }
let aud = new Audio
        function playClickSound() {
            // Create audio context for click sound simulation

            aud.src = "./audios/pkus.ogg"
        aud.play()
        }

        function playResetSound() {
                   aud.src = "./audios/reset.ogg"
        aud.play()

        }

        function calcArc(color) {
            arc = (step / maxSteps) * 360;
            circle.style.background = `conic-gradient(${color} ${arc}deg, #1a1a1a ${arc}deg)`;
            
            // Add pulse effect when reaching milestones
            if (step % 11 === 0 && step > 0) {
                circle.style.boxShadow = `0 0 100px ${color}50, inset 0 0 50px rgba(0, 0, 0, 0.5)`;
                setTimeout(() => {
                    circle.style.boxShadow = '0 0 50px rgba(0, 255, 136, 0.3), inset 0 0 50px rgba(0, 0, 0, 0.5)';
                }, 300);
            }
        }

        function create(classN, mark, step) {
            const num = document.createElement('div');
            num.className = `${classN}`;
            num.textContent = `${mark}${inc}`;
            circle.appendChild(num);
            document.querySelector(".current").textContent = `33/${step}`;
            
            // Remove floating number after animation
            // setTimeout(() => {
            //     if (num.parentNode) {
            //         num.remove();
            //     }
            // }, 1000);
        }

        // Initialize with smooth entrance animation
        window.addEventListener('load', () => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease-in';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });

        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    increaseArc();
                    break;
                case 'Backspace':
                    e.preventDefault();
                    decreaseArc();
                    break;
                case 'r':
                case 'R':
                    reset();
                    break;
            }
        });
//  end dakr count


//   compas
        const compassSvg = document.getElementById('compass-svg');
        const qiblaNeedle = document.getElementById('qibla-needle');
        const status = document.getElementById('status');
        const permissionBtn = document.getElementById('permission-btn');
        const cityElement = document.getElementById('city');
        const qiblaSound = document.getElementById('qiblaSound');

        const MECCA_LAT = 21.422487;
        const MECCA_LONG = 39.826206;
        const QIBLA_THRESHOLD = 5;
        let qiblaAngle = 0;
        let isQiblaFound = false;

        function calculateQibla(lat, lng) {
            const φ1 = lat * Math.PI / 180;
            const φ2 = MECCA_LAT * Math.PI / 180;
            const Δλ = (MECCA_LONG - lng) * Math.PI / 180;
            const y = Math.sin(Δλ);
            const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
            return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
        }

        function handleOrientation(e) {
            let heading;
            if (e.webkitCompassHeading) {
                heading = e.webkitCompassHeading;
            } else if (e.alpha) {
                heading = 360 - e.alpha;
            }

            if (heading !== undefined) {
                compassSvg.style.transform = `rotate(${heading}deg)`;

                const difference = Math.abs((heading - qiblaAngle + 360) % 360);
                const isPointingQibla = difference <= QIBLA_THRESHOLD || difference >= (360 - QIBLA_THRESHOLD);

                if (isPointingQibla && !isQiblaFound) {
                    isQiblaFound = true;
                    document.body.classList.add('qibla-found');
                    status.textContent = "تم العثور علي القبله  !";
                    qiblaSound.play().catch(error => console.log("Erreur de lecture audio:", error));

                    setTimeout(() => {
                        document.body.classList.remove('qibla-found');
                        isQiblaFound = false;
                        qiblaSound.pause();
                    }, 5000);
                }
            }
        }

        function startCompass() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async position => {
                    const { latitude, longitude } = position.coords;
                    qiblaAngle = calculateQibla(latitude, longitude);
                    qiblaNeedle.style.transform = `rotate(${qiblaAngle}deg)`;

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                        const data = await response.json();
                        cityElement.textContent = data.address.city || data.address.town || "Position actuelle";
                    } catch (e) {
                        cityElement.textContent = "Position actuelle";
                    }
                }, useIPFallback);
            } else {
                useIPFallback();
            }
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        function useIPFallback() {
            fetch("https://ipapi.co/json/")
                .then(response => response.json())
                .then(data => {
                    qiblaAngle = calculateQibla(data.latitude, data.longitude);
                    qiblaNeedle.style.transform = `rotate(${qiblaAngle}deg)`;
                    cityElement.textContent = data.city || "Position actuelle";
                })
                .catch(error => {
                    cityElement.textContent = "Position inconnue";
                    console.log("Erreur IP Geolocation:", error);
                });
        }

        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            permissionBtn.style.display = 'block';
            permissionBtn.onclick = async () => {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    startCompass();
                    permissionBtn.style.display = 'none';
                }
            };
        } else {
            startCompass();
        }
//  end compas
// start calender
        class HijriCalendar {
            constructor() {
                this.islamicMonths = [
                    { ar: 'محرم', en: 'Muharram' },
                    { ar: 'صفر', en: 'Safar' },
                    { ar: 'ربيع الأول', en: 'Rabi al-Awwal' },
                    { ar: 'ربيع الثاني', en: 'Rabi al-Thani' },
                    { ar: 'جمادى الأولى', en: 'Jumada al-Awwal' },
                    { ar: 'جمادى الثانية', en: 'Jumada al-Thani' },
                    { ar: 'رجب', en: 'Rajab' },
                    { ar: 'شعبان', en: 'Shaban' },
                    { ar: 'رمضان', en: 'Ramadan' },
                    { ar: 'شوال', en: 'Shawwal' },
                    { ar: 'ذو القعدة', en: 'Dhu al-Qadah' },
                    { ar: 'ذو الحجة', en: 'Dhu al-Hijjah' }
                ];

                this.dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                this.gregorianMonths = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

                this.currentDate = new Date();
                this.displayDate = new Date();

                this.init();
            }

            init() {
                this.renderIslamicMonths();
                this.renderCalendar();
                this.updateCurrentDate();
                this.setupEventListeners();
                this.highlightToday();
            }

            // Accurate Hijri conversion
            gregorianToHijri(gregorianDate) {
                // Hijri epoch starts on July 16, 622 CE (Gregorian)
                const hijriEpoch = new Date(622, 6, 16); // July 16, 622
                const daysSinceHijriEpoch = Math.floor((gregorianDate.getTime() - hijriEpoch.getTime()) / (1000 * 60 * 60 * 24));

                // Average Hijri year is 354.367 days
                const averageHijriYear = 354.367;
                let hijriYear = Math.floor(daysSinceHijriEpoch / averageHijriYear) + 1;

                // Calculate remaining days after full years
                let remainingDays = daysSinceHijriEpoch - Math.floor((hijriYear - 1) * averageHijriYear);

                // Hijri months (alternating 30 and 29 days, with adjustments)
                const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

                let hijriMonth = 1;
                for (let i = 0; i < 12; i++) {
                    if (remainingDays <= monthLengths[i]) {
                        hijriMonth = i + 1;
                        break;
                    }
                    remainingDays -= monthLengths[i];
                }

                let hijriDay = Math.max(1, Math.ceil(remainingDays));

                // Ensure valid ranges
                hijriYear = Math.max(1, hijriYear);
                hijriMonth = Math.min(Math.max(hijriMonth, 1), 12);
                hijriDay = Math.min(Math.max(hijriDay, 1), 30);

                return {
                    year: hijriYear,
                    month: hijriMonth,
                    day: hijriDay
                };
            }

            formatHijriDate(hijriDate) {
                const monthName = this.islamicMonths[hijriDate.month - 1];
                return {
                    ar: `${hijriDate.day} ${monthName.ar} ${hijriDate.year}`,
                    en: `${hijriDate.day} ${monthName.en} ${hijriDate.year}`,
                    monthAr: monthName.ar,
                    monthEn: monthName.en
                };
            }

            renderIslamicMonths() {
                const monthsGrid = document.getElementById('monthsGrid');
                monthsGrid.innerHTML = this.islamicMonths.map(month => `
            <div class="month-item">
                <span class="month-name-ar">${month.ar}</span>
                <span class="month-name-en">${month.en}</span>
            </div>
        `).join('');
            }

            renderCalendar() {
                const calendarGrid = document.getElementById('calendarGrid');
                const hijriMonth = document.getElementById('hijriMonth');
                const gregorianMonth = document.getElementById('gregorianMonth');

                // Get first day of the month
                const firstDay = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth(), 1);
                const lastDay = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth() + 1, 0);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - firstDay.getDay());

                // Update month headers
                const firstHijri = this.gregorianToHijri(firstDay);
                const formattedHijri = this.formatHijriDate(firstHijri);
                hijriMonth.textContent = `${formattedHijri.monthAr} ${firstHijri.year}`;
                gregorianMonth.textContent = `${this.gregorianMonths[this.displayDate.getMonth()]} ${this.displayDate.getFullYear()}`;

                // Render day headers
                let gridHTML = this.dayNames.map(day =>
                    `<div class="day-header">${day}</div>`
                ).join('');

                // Render calendar days
                for (let i = 0; i < 42; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);

                    const isCurrentMonth = currentDate.getMonth() === this.displayDate.getMonth();
                    const isToday = currentDate.toDateString() === new Date().toDateString();
                    const hijriDate = this.gregorianToHijri(currentDate);

                    gridHTML += `
                <div class="day-cell ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}" 
                     data-date="${currentDate.toISOString()}">
                    <span class="gregorian-date">${currentDate.getDate()}</span>
                    <span class="hijri-date">${hijriDate.day}</span>
                </div>
            `;
                }

                calendarGrid.innerHTML = gridHTML;
            }

            updateCurrentDate() {
                const currentHijri = document.getElementById('currentHijri');
                const currentGregorian = document.getElementById('currentGregorian');

                const hijriDate = this.gregorianToHijri(this.currentDate);
                const formattedHijri = this.formatHijriDate(hijriDate);

                // guard in case elements are missing
                if (currentHijri) currentHijri.textContent = formattedHijri.ar;
                if (currentGregorian) currentGregorian.textContent = this.currentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            highlightToday() {
                // Add pulse animation to today's date
                const todayCell = document.querySelector('.day-cell.today');
                if (todayCell) {
                    todayCell.classList.add('pulse');
                }
            }

            setupEventListeners() {
                document.getElementById('prevBtn').addEventListener('click', () => {
                    this.displayDate.setMonth(this.displayDate.getMonth() - 1);
                    this.renderCalendar();
                });

                document.getElementById('nextBtn').addEventListener('click', () => {
                    this.displayDate.setMonth(this.displayDate.getMonth() + 1);
                    this.renderCalendar();
                });

                // Add click events to calendar days
                document.addEventListener('click', (e) => {
                    if (e.target.closest('.day-cell') && !e.target.closest('.day-cell').classList.contains('other-month')) {
                        const dateStr = e.target.closest('.day-cell').dataset.date;
                        if (dateStr) {
                            const selectedDate = new Date(dateStr);
                            this.showDateDetails(selectedDate);
                        }
                    }
                });
            }

            showDateDetails(date) {
                const hijriDate = this.gregorianToHijri(date);
                const formattedHijri = this.formatHijriDate(hijriDate);

                // Update the current date display
                const ch = document.getElementById('currentHijri');
                const cg = document.getElementById('currentGregorian');
                if (ch) ch.textContent = formattedHijri.ar;
                if (cg) cg.textContent = date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                // Add a subtle animation
                const display = document.querySelector('.current-date-display');
                if (display) {
                    display.style.transform = 'scale(1.05)';
                    setTimeout(() => { display.style.transform = 'scale(1)'; }, 200);
                }
            }
        }

        // Initialize the calendar when the page loads
        let calendar;

        document.addEventListener('DOMContentLoaded', () => {
            calendar = new HijriCalendar(); // إنشاء الكائن مرة واحدة فقط
        });

        // Update current time every minute
        setInterval(() => {
            if (calendar) calendar.updateCurrentDate();
        }, 60000);
// end calender
