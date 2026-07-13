// AIR by Revolut clone — interactions

// ---------- Nav scroll state ----------
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
	nav.classList.toggle("is-scrolled", window.scrollY > 10);
}, { passive: true });

// ---------- Mobile menu ----------
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
burger.addEventListener("click", () => {
	const open = mobileMenu.classList.toggle("is-open");
	burger.setAttribute("aria-expanded", String(open));
});

// ---------- Phone clock ----------
function tickClock() {
	const d = new Date();
	document.getElementById("phoneClock").textContent =
		`${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}
tickClock();
setInterval(tickClock, 30_000);

// ---------- Chat scenarios (one per hero tab) ----------
const SCENARIOS = {
	holiday: [
		{ who: "user", text: "How much did I spend on my Lisbon trip?" },
		{ who: "air", text: "You spent \u00a3642.18 in Lisbon between 2\u20136 July. Here\u2019s the breakdown:" },
		{ who: "card", html: `
			<div class="card-title">Lisbon \u00b7 2\u20136 Jul</div>
			<div class="card-big">\u00a3642.18</div>
			<div class="card-row"><span>\ud83c\udf7d Eating out</span><b>\u00a3248.40</b></div>
			<div class="card-row"><span>\ud83c\udfe8 Stays</span><b>\u00a3221.00</b></div>
			<div class="card-row"><span>\ud83d\ude95 Transport</span><b>\u00a396.78</b></div>
			<div class="card-bar"><i></i></div>` },
		{ who: "air", text: "That\u2019s 12% under the budget you set. Want me to create a budget for your next trip?" },
	],
	travel: [
		{ who: "user", text: "I\u2019m flying to Tokyo on Friday. What do I need?" },
		{ who: "air", text: "Exciting! \u2708\ufe0f Here\u2019s what I can sort out for you right now:" },
		{ who: "card", html: `
			<div class="card-title">Tokyo essentials</div>
			<div class="card-row"><span>\ud83d\udcf6 eSIM \u00b7 5GB, 7 days</span><b>\u00a39.50</b></div>
			<div class="card-row"><span>\ud83d\udcb4 GBP \u2192 JPY</span><b>1 = \u00a5192.40</b></div>
			<div class="card-row"><span>\ud83d\udee1 Travel insurance</span><b class="up">Included</b></div>` },
		{ who: "air", text: "Want me to activate the eSIM so it\u2019s ready when you land?" },
	],
	portfolio: [
		{ who: "user", text: "How are my investments doing this month?" },
		{ who: "air", text: "Your portfolio is up 2.4% this month. Here\u2019s the snapshot:" },
		{ who: "card", html: `
			<div class="card-title">Portfolio \u00b7 July</div>
			<div class="card-big">\u00a35,830.12 <span class="up" style="font-size:14px">\u25b2 2.4%</span></div>
			<div class="card-row"><span>AAPL</span><b class="up">+4.1%</b></div>
			<div class="card-row"><span>VUSA</span><b class="up">+1.8%</b></div>
			<div class="card-row"><span>TSLA</span><b class="down">\u22120.9%</b></div>` },
		{ who: "air", text: "Your best performer is Apple. Capital at risk \u2014 want the full report?" },
	],
	cards: [
		{ who: "user", text: "I can\u2019t find my card. Freeze it please!" },
		{ who: "air", text: "Done \u2014 your Metal card ending in 4921 is frozen. \ud83e\uddca No payments can go through." },
		{ who: "card", html: `
			<div class="card-title">Card status</div>
			<div class="card-big">Frozen \u2744\ufe0f</div>
			<div class="card-row"><span>Metal \u00b7\u00b7 4921</span><b>Frozen just now</b></div>
			<div class="card-row"><span>Online payments</span><b class="down">Blocked</b></div>
			<div class="card-row"><span>ATM withdrawals</span><b class="down">Blocked</b></div>` },
		{ who: "air", text: "If it turns up, just ask me to unfreeze it. Should I order a replacement in the meantime?" },
	],
	subs: [
		{ who: "user", text: "Which subscriptions am I paying for?" },
		{ who: "air", text: "You have 6 active subscriptions totalling \u00a358.94/month. The biggest ones:" },
		{ who: "card", html: `
			<div class="card-title">Subscriptions \u00b7 monthly</div>
			<div class="card-big">\u00a358.94</div>
			<div class="card-row"><span>\ud83c\udfa8 Streaming</span><b>\u00a317.98</b></div>
			<div class="card-row"><span>\ud83c\udfa7 Music</span><b>\u00a311.99</b></div>
			<div class="card-row"><span>\u2601\ufe0f Cloud storage</span><b>\u00a37.99</b></div>` },
		{ who: "air", text: "You haven\u2019t used one of them since April. Want me to pause it?" },
	],
};

const chatEl = document.getElementById("chat");
const tabs = document.querySelectorAll(".chip");
let playToken = 0;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function playScenario(key) {
	const token = ++playToken;
	const script = SCENARIOS[key];
	chatEl.innerHTML = "";

	for (const step of script) {
		if (token !== playToken) return; // superseded by a newer tab click

		if (step.who !== "user") {
			// show typing indicator before AIR responds
			const typing = document.createElement("div");
			typing.className = "typing";
			typing.innerHTML = "<i></i><i></i><i></i>";
			chatEl.appendChild(typing);
			await wait(850);
			typing.remove();
			if (token !== playToken) return;
		}

		const el = document.createElement("div");
		if (step.who === "card") {
			el.className = "msg msg--card";
			el.innerHTML = step.html;
		} else {
			el.className = `msg msg--${step.who}`;
			el.textContent = step.text;
		}
		chatEl.appendChild(el);
		await wait(step.who === "user" ? 900 : 1300);
	}

	// loop after a pause
	await wait(4000);
	if (token === playToken) playScenario(key);
}

tabs.forEach((tab) => {
	tab.addEventListener("click", () => {
		tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
		tab.setAttribute("aria-selected", "true");
		stopAutoRotate();
		playScenario(tab.dataset.scenario);
	});
});

// ---------- Auto-rotate tabs until the user picks one ----------
const KEYS = [...tabs].map((t) => t.dataset.scenario);
let autoIndex = 0;
let autoTimer = setInterval(() => {
	autoIndex = (autoIndex + 1) % KEYS.length;
	tabs.forEach((t, i) => t.setAttribute("aria-selected", String(i === autoIndex)));
	playScenario(KEYS[autoIndex]);
}, 14_000);

function stopAutoRotate() {
	if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
}

// kick off
playScenario("holiday");

// ---------- Login Modal ----------
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const loginClose = document.getElementById("loginClose");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginSignupLink = document.getElementById("loginSignupLink");

function openLogin() {
	loginModal.hidden = false;
	// Force reflow so the transition fires
	loginModal.offsetHeight;
	loginModal.classList.add("is-open");
	loginEmail.focus();
	document.body.style.overflow = "hidden";
}

function closeLogin() {
	loginModal.classList.remove("is-open");
	document.body.style.overflow = "";
	loginModal.addEventListener("transitionend", function handler() {
		loginModal.removeEventListener("transitionend", handler);
		loginModal.hidden = true;
	});
	loginForm.reset();
	loginError.hidden = true;
	loginBtn.focus();
}

loginBtn.addEventListener("click", openLogin);
loginClose.addEventListener("click", closeLogin);

// Close on overlay click
loginModal.addEventListener("click", (e) => {
	if (e.target === loginModal) closeLogin();
});

// Close on Escape
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape" && loginModal.classList.contains("is-open")) closeLogin();
});

// Close modal on sign-up link click
loginSignupLink.addEventListener("click", closeLogin);

// Form validation & submit
loginForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const email = loginEmail.value.trim();
	const pass = loginPassword.value;

	if (!email || !pass) {
		loginError.textContent = "Please enter your email and password.";
		loginError.hidden = false;
		return;
	}

	// Simulate auth check (demo only)
	loginError.textContent = "Invalid email or password. Please try again.";
	loginError.hidden = false;
});
