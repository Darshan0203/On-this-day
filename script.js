let dataStore = {
    events: [],
    births: [],
    deaths: []
};

let currentTab = "events";

async function loadData() {
    const dateInput = document.getElementById("dateInput").value;
    if (!dateInput) {
        alert("Please select a date");
        return;
    }

    const date = new Date(dateInput);
    const day = date.getDate();
    const month = date.getMonth() + 1;

    const content = document.getElementById("content");
    content.innerHTML = "⏳ Loading historical data...";

    try {
        const [eventsRes, birthsRes, deathsRes] = await Promise.all([
            fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`),
            fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${month}/${day}`),
            fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/deaths/${month}/${day}`)
        ]);

        const eventsData = await eventsRes.json();
        const birthsData = await birthsRes.json();
        const deathsData = await deathsRes.json();

        dataStore.events = eventsData.events || [];
        dataStore.births = birthsData.births || [];
        dataStore.deaths = deathsData.deaths || [];

        render();

    } catch (err) {
        console.error(err);
        content.innerHTML = "❌ Failed to load data. Please try again.";
    }
}

function switchTab(tab) {
    currentTab = tab;

    document.querySelectorAll(".tabs button").forEach(btn =>
        btn.classList.remove("active")
    );
    event.target.classList.add("active");

    render();
}

function render() {
    const container = document.getElementById("content");
    container.innerHTML = "";

    const items = dataStore[currentTab];

    if (!items || items.length === 0) {
        container.innerHTML = "No data available.";
        return;
    }

    items.slice(0, 8).forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        const img =
            item.pages?.[0]?.thumbnail?.source || "";

        card.innerHTML = `
            ${img ? `<img src="${img}" />` : ""}
            <div>
                <h3>${item.year || "—"}</h3>
                <p>${item.text}</p>
                <p><em>${generateInsight()}</em></p>
                <div class="actions">
                    <button onclick="speak(\`${item.text}\`)">🔊 Listen</button>
                    <button onclick="share(\`${item.text}\`)">📤 Share</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function generateInsight() {
    return "Did you know? ";
}

/* Voice narration */
function speak(text) {
    speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US";
    speechSynthesis.speak(msg);
}

/* Share feature */
function share(text) {
    if (!navigator.share) {
        alert("Sharing not supported on this device.");
        return;
    }
    navigator.share({
        title: "On This Day",
        text
    });
}
