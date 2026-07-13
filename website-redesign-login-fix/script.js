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
		{ who: "air", text: "You spent £642.18 in Lisbon between 2–6 July. Here's the breakdown:" },
		{ who: "card", html: `
			<div class="card-title">Lisbon · 2–6 Jul</div>
			<div class="card-big">£642.18</div>
			<div class="card-row"><span>🍽 Eating out</span><b>£248.40</b></div>
			<div class="card-row"><span>🏨 Stays</span><b>£221.00</b></div>
			<div class="card-row"><span>🚕 Transport</span><b>£96.78</b></div>
			<div class="card-bar"><i></i></div>` },
		{ who: "air", text: "That's 12% under the budget you set. Want me to create a budget for your next trip?" },
	],
	travel: [
		{ who: "user", text: "I'm flying to Tokyo on Friday. What do I need?" },
		{ who: "air", text: "Exciting! ✈️ Here's what I can sort out for you right now:" },
		{ who: "card", html: `
			<div class="card-title">Tokyo essentials</div>
			<div class="card-row"><span>📶 eSIM · 5GB, 7 days</span><b>£9.50</b></div>
			<div class="card-row"><span>💴 GBP → JPY</span><b>1 = ¥192.40</b></div>
			<div class="card-row"><span>🛡 Travel insurance</span><b class="up">Included</b></div>` },
		{ who: "air", text: "Want me to activate the eSIM so it's ready when you land?" },
	],
	portfolio: [
		{ who: "user", text: "How are my investments doing this month?" },
		{ who: "air", text: "Your portfolio is up 2.4% this month. Here's the snapshot:" },
		{ who: "card", html: `
			<div class="card-title">Portfolio · July</div>
			<div class="card-big">£5,830.12 <span class="up" style="font-size:14px">▲ 2.4%</span></div>
			<div class="card-row"><span>AAPL</span><b class="up">+4.1%</b></div>
			<div class="card-row"><span>VUSA</span><b class="up">+1.8%</b></div>
			<div class="card-row"><span>TSLA</span><b class="down">−0.9%</b></div>` },
		{ who: "air", text: "Your best performer is Apple. Capital at risk — want the full report?" },
	],
	cards: [
		{ who: "user", text: "I can't find my card. Freeze it please!" },
		{ who: "air", text: "Done — your Metal card ending in 4921 is frozen. 🧊 No payments can go through." },
		{ who: "card", html: `
			<div class="card-title">Card status</div>
			<div class="card-big">Frozen ❄️</div>
			<div class="card-row"><span>Metal ·· 4921</span><b>Frozen just now</b></div>
			<div class="card-row"><span>Online payments</span><b class="down">Blocked</b></div>
			<div class="card-row"><span>ATM withdrawals</span><b class="down">Blocked</b></div>` },
		{ who: "air", text: "If it turns up, just ask me to unfreeze it. Should I order a replacement in the meantime?" },
	],
	subs: [
		{ who: "user", text: "Which subscriptions am I paying for?" },
		{ who: "air", text: "You have 6 active subscriptions totalling £58.94/month. The biggest ones:" },
		{ who: "card", html: `
			<div class="card-title">Subscriptions · monthly</div>
			<div class="card-big">£58.94</div>
			<div class="card-row"><span>🎬 Streaming</span><b>£17.98</b></div>
			<div class="card-row"><span>🎧 Music</span><b>£11.99</b></div>
			<div class="card-row"><span>☁️ Cloud storage</span><b>£7.99</b></div>` },
		{ who: "air", text: "You haven't used one of them since April. Want me to pause it?" },
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

// ---------- Login modal ----------
const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formError = document.getElementById("formError");
const submitBtn = document.getElementById("loginSubmit");
const togglePassword = document.getElementById("togglePassword");
const navRight = document.getElementById("navRight");

let lastFocused = null;

function focusable() {
	return [...loginModal.querySelectorAll(
		'button, [href], input, [tabindex]:not([tabindex="-1"])'
	)].filter((el) => !el.disabled && el.offsetParent !== null);
}

function openLogin(trigger) {
	lastFocused = trigger || document.activeElement;
	loginModal.hidden = false;
	document.body.classList.add("modal-open");
	// focus first input once the dialog is painted
	requestAnimationFrame(() => emailInput.focus());
}

function closeLogin() {
	if (loginModal.hidden) return;
	loginModal.hidden = true;
	document.body.classList.remove("modal-open");
	clearErrors();
	if (lastFocused && document.body.contains(lastFocused)) lastFocused.focus();
}

function clearErrors() {
	[["email", emailError, emailInput], ["password", passwordError, passwordInput]].forEach(
		([, err, input]) => {
			err.hidden = true;
			input.closest(".field").classList.remove("field--invalid");
		}
	);
	formError.hidden = true;
}

// Open triggers (nav + mobile menu)
document.querySelectorAll("[data-open-login]").forEach((btn) => {
	btn.addEventListener("click", (e) => {
		e.preventDefault();
		mobileMenu.classList.remove("is-open");
		burger.setAttribute("aria-expanded", "false");
		openLogin(e.currentTarget);
	});
});

// Close triggers (X button, overlay, "Create account")
loginModal.querySelectorAll("[data-close-login]").forEach((el) => {
	el.addEventListener("click", closeLogin);
});

// ESC to close + focus trap
document.addEventListener("keydown", (e) => {
	if (loginModal.hidden) return;
	if (e.key === "Escape") { closeLogin(); return; }
	if (e.key === "Tab") {
		const items = focusable();
		if (!items.length) return;
		const first = items[0];
		const last = items[items.length - 1];
		if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
		else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
	}
});

// Show / hide password
togglePassword.addEventListener("click", () => {
	const show = passwordInput.type === "password";
	passwordInput.type = show ? "text" : "password";
	togglePassword.textContent = show ? "Hide" : "Show";
	togglePassword.setAttribute("aria-pressed", String(show));
	togglePassword.setAttribute("aria-label", show ? "Hide password" : "Show password");
	passwordInput.focus();
});

// Clear a field's error as the user corrects it
[emailInput, passwordInput].forEach((input) => {
	input.addEventListener("input", () => {
		input.closest(".field").classList.remove("field--invalid");
		(input === emailInput ? emailError : passwordError).hidden = true;
		formError.hidden = true;
	});
});

function validate() {
	let ok = true;
	const email = emailInput.value.trim();
	if (!email) {
		emailError.textContent = "Please enter your email.";
		emailError.hidden = false;
		emailInput.closest(".field").classList.add("field--invalid");
		ok = false;
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		emailError.textContent = "Please enter a valid email address.";
		emailError.hidden = false;
		emailInput.closest(".field").classList.add("field--invalid");
		ok = false;
	}
	if (!passwordInput.value) {
		passwordError.hidden = false;
		passwordInput.closest(".field").classList.add("field--invalid");
		ok = false;
	}
	return ok;
}

// Submit (stubbed — no backend). Any valid credentials succeed;
// use password "wrong" to preview the failure state.
loginForm.addEventListener("submit", (e) => {
	e.preventDefault();
	formError.hidden = true;
	if (!validate()) {
		loginModal.querySelector(".field--invalid .field__input")?.focus();
		return;
	}

	submitBtn.setAttribute("aria-busy", "true");
	submitBtn.disabled = true;
	submitBtn.innerHTML = '<span class="spinner"></span> Logging in…';

	setTimeout(() => {
		const failed = passwordInput.value === "wrong";
		submitBtn.removeAttribute("aria-busy");
		submitBtn.disabled = false;
		submitBtn.textContent = "Log in";

		if (failed) {
			formError.textContent = "Incorrect email or password. Please try again.";
			formError.hidden = false;
			passwordInput.focus();
			return;
		}

		const email = emailInput.value.trim();
		closeLogin();
		loginForm.reset();
		setLoggedIn(email);
	}, 900);
});

function setLoggedIn(email) {
	const initial = (email[0] || "U").toUpperCase();
	navRight.innerHTML = `
		<span class="account" title="${email}">
			<span class="account__avatar">${initial}</span>
			<span class="account__label">Account</span>
		</span>
		<button type="button" class="btn btn--outline btn--sm" id="logoutBtn">Log out</button>`;
	document.getElementById("logoutBtn").addEventListener("click", () => {
		navRight.innerHTML = `
			<button type="button" class="btn btn--ghost btn--sm" id="loginBtn" data-open-login>Log in</button>
			<a href="#signup" class="btn btn--white btn--sm">Sign up</a>`;
		navRight.querySelector("[data-open-login]").addEventListener("click", (e) => {
			e.preventDefault();
			openLogin(e.currentTarget);
		});
	});
}

// Decorative QR pattern (matches the design reference)
(function buildQR() {
	const grid = document.getElementById("qrGrid");
	if (!grid) return;
	const N = 21;
	const isFinder = (r, c) => {
		const inBox = (br, bc) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
		return inBox(0, 0) || inBox(0, N - 7) || inBox(N - 7, 0);
	};
	const finderOn = (r, c) => {
		const rel = (br, bc) => { const x = r - br, y = c - bc; return (x === 0 || x === 6 || y === 0 || y === 6) || (x >= 2 && x <= 4 && y >= 2 && y <= 4); };
		if (r < 7 && c < 7) return rel(0, 0);
		if (r < 7 && c >= N - 7) return rel(0, N - 7);
		if (r >= N - 7 && c < 7) return rel(N - 7, 0);
		return false;
	};
	// deterministic pseudo-random fill so the code looks consistent
	let seed = 7;
	const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	const center = (r, c) => r >= 8 && r <= 12 && c >= 8 && c <= 12;
	const frag = document.createDocumentFragment();
	for (let r = 0; r < N; r++) {
		for (let c = 0; c < N; c++) {
			const cell = document.createElement("i");
			const on = isFinder(r, c) ? finderOn(r, c) : (center(r, c) ? false : rand() > 0.5);
			if (!on) cell.style.background = "transparent";
			frag.appendChild(cell);
		}
	}
	grid.appendChild(frag);
	const logo = document.createElement("span");
	logo.className = "qr-logo";
	logo.textContent = "R";
	grid.appendChild(logo);
})();
