/* ====== ضع هنا رابط Apps Script الخاص بتسجيل الدخول (منفصل عن نظام العيادة) ====== */
const LOGIN_API = "https://script.google.com/macros/s/AKfycbwXYTVKsUA5LAr0WHsqZ8ClQyXhrpqgkI1_4laoa4p0PCouiXgNioGe0gUxCjdzXAvUAw/exec";

// ===== عناصر شاشة اللوجن =====
const loginScreen = document.getElementById("loginScreen");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const errorBox = document.getElementById("errorBox");
const loginBtn = document.getElementById("loginBtn");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");
const rememberEl = document.getElementById("remember");

function showApp(user) {
    loginScreen.style.display = "none";
    document.getElementById("userNameLabel").textContent = (user && (user.name || user.username)) || "";
    document.getElementById("appContainer").style.display = "block";
}

function showLogin() {
    document.getElementById("appContainer").style.display = "none";
    loginScreen.style.display = "flex";
}

// ===== التحقق من وجود جلسة محفوظة =====
(function checkAuth(){
    const session = localStorage.getItem("clinicUser") || sessionStorage.getItem("clinicUser");
    if (session) {
        try { showApp(JSON.parse(session)); }
        catch(e) { showLogin(); }
    } else {
        showLogin();
    }
})();

// تعبئة اسم المستخدم المحفوظ (تذكرني)
(function fillRemembered(){
    const saved = localStorage.getItem("rememberedUser");
    if (saved) {
        usernameEl.value = saved;
        rememberEl.checked = true;
    }
})();

function togglePassword() {
    const isPass = passwordEl.type === "password";
    passwordEl.type = isPass ? "text" : "password";
    document.getElementById("togglePass").textContent = isPass ? "🙈" : "👁️";
}

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
}
function hideError() { errorBox.style.display = "none"; }

function setLoading(state) {
    loginBtn.disabled = state;
    spinner.style.display = state ? "inline-block" : "none";
    btnText.textContent = state ? "جاري التحقق..." : "تسجيل الدخول";
}

[usernameEl, passwordEl].forEach(el => {
    el.addEventListener("keydown", e => { if (e.key === "Enter") login(); });
    el.addEventListener("input", hideError);
});

async function login() {
    hideError();
    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    if (!username || !password) {
        showError("من فضلك أدخل اسم المستخدم وكلمة المرور");
        return;
    }

    setLoading(true);

    try {
        const res = await fetch(LOGIN_API, {
            method: "POST",
            body: JSON.stringify({ action: "login", username, password })
        });

        const data = await res.json();

        if (data && data.success) {
            const userInfo = {
                username: data.username || username,
                name: data.name || username,
                role: data.role || "",
                loggedAt: new Date().toISOString()
            };

            if (rememberEl.checked) {
                localStorage.setItem("rememberedUser", username);
                localStorage.setItem("clinicUser", JSON.stringify(userInfo));
            } else {
                localStorage.removeItem("rememberedUser");
                sessionStorage.setItem("clinicUser", JSON.stringify(userInfo));
            }

            btnText.textContent = "تم الدخول ✓";
            setTimeout(() => { setLoading(false); showApp(userInfo); }, 400);
        } else {
            setLoading(false);
            showError(data.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
        }
    } catch (err) {
        setLoading(false);
        showError("حدث خطأ في الاتصال. تأكد من الإنترنت وحاول مرة أخرى");
    }
}

function logout() {
    localStorage.removeItem("clinicUser");
    sessionStorage.removeItem("clinicUser");
    usernameEl.value = "";
    passwordEl.value = "";
    showLogin();
}

const API = "https://script.google.com/macros/s/AKfycbxkapaX0PIu4jtLPRrSa6TDfMTIII43HhiiBFyadcQLlCBUa-P1cfqze38GTQGI-O0g/exec";

const procedures = {
"تنظيف دوري (Scaling & Polishing)":250,"فلورايد + وقائي":300,"حشو عادي":600,
"حشو عصب (Root Canal)":1200,"خلع عادي":300,"خلع ضرس عقل":800,
"تبييض الأسنان":1500,"فينير / لومينير":3500,"نحت اللثة":1000,
"تيجان وجسور":2000,"أطقم أسنان":2500,"زراعة أسنان":6000,
"تقويم ثابت":8000,"مصففات شفافة":12000,"علاج لثة":900,"زراعة عظام":4000
};

function fill(id){
  let el=document.getElementById(id);
  el.innerHTML="<option value=''>اختر الإجراء</option>";
  for(let p in procedures){
    el.innerHTML+=`<option value="${p}">${p}</option>`;
  }
}
fill("proc1"); fill("proc2");

function toggleCustom(n) {
    document.getElementById(`customFields${n}`).style.display = 
        document.getElementById(`custom${n}`).checked ? "grid" : "none";
}

function calc(n) {
    let total = 0;
    if (document.getElementById(`custom${n}`).checked) {
        total = +document.getElementById(`customPrice${n}`).value || 0;
    } else {
        total = procedures[document.getElementById(`proc${n}`).value] || 0;
    }
    document.getElementById(`total${n}`).value = total;
    let paid = +document.getElementById(`paid${n}`).value || 0;
    document.getElementById(`remain${n}`).value = total - paid;
}

proc1.onchange = () => { if(!custom1.checked) calc(1); };
proc2.onchange = () => { if(!custom2.checked) calc(2); };
paid1.oninput = () => calc(1);
paid2.oninput = () => calc(2);

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("session2Date").value = today;
}
setTodayDate();

// السكرول العلوي
const topScroll = document.getElementById('topScroll');
const bottomScroll = document.getElementById('bottomScroll');

topScroll.addEventListener('scroll', () => bottomScroll.scrollLeft = topScroll.scrollLeft);
bottomScroll.addEventListener('scroll', () => topScroll.scrollLeft = bottomScroll.scrollLeft);

async function save(){
    const data = {
        name: document.getElementById("name").value || "",
        phone: document.getElementById("phone").value || "",
        doctor: document.getElementById("doctor").value || "",

        check1:check1.checked, consult1:consult1.checked,
        proc1: custom1.checked ? document.getElementById("customProc1").value : proc1.value,
        total1: +total1.value||0,
        paid1: +paid1.value||0,

        check2:check2.checked, consult2:consult2.checked,
        proc2: custom2.checked ? document.getElementById("customProc2").value : proc2.value,
        total2: +total2.value||0,
        paid2: +paid2.value||0,

        session2Date: document.getElementById("session2Date").value || "",
        payment:payment.value
    };

    await fetch(API,{method:"POST", body:JSON.stringify(data)});

    const btn = document.querySelector("button");
    const orig = btn.innerHTML;
    btn.innerHTML = "✅ تم الحفظ بنجاح";
    setTimeout(()=> btn.innerHTML = orig, 2000);
    
    load();
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("doctor").value = "";
    setTodayDate();
}

async function load(){
    const res = await fetch(API);
    const data = await res.json();

    let html = "<tr>";
    data[0].forEach(h => html += `<th>${h}</th>`);
    html += "</tr>";

    for(let i=1; i<data.length; i++){
        html += "<tr>";
        data[i].forEach(c => html += `<td>${c}</td>`);
        html += "</tr>";
    }
    document.getElementById("table").innerHTML = html;
syncScrollWidth();
}

function filterTable() {
    const term = document.getElementById("searchInput").value.toLowerCase().trim();
    const rows = document.querySelectorAll("#table tr");
    rows.forEach((row, i) => {
        if (i === 0) return;
        row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
    });
}

load();

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}
if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
function syncScrollWidth() {
    const table = document.getElementById("table");
    const scrollContent = document.getElementById("scrollContent");
    scrollContent.style.width = table.scrollWidth + "px";
}


