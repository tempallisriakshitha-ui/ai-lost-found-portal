
document.addEventListener("DOMContentLoaded", function () {

    // =================================
    // 1. GET HTML ELEMENTS
    // =================================

    const loginBox = document.getElementById("loginBox");
    const registerBox = document.getElementById("registerBox");
    const dashboard = document.getElementById("dashboard");

    const lostForm = document.getElementById("lostForm");
    const foundForm = document.getElementById("foundForm");
    const viewItemsPage = document.getElementById("viewItemsPage");

    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");

    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    const loginMessage = document.getElementById("loginMessage");
    const registerMessage = document.getElementById("registerMessage");

    const lostBtn = document.getElementById("lostBtn");
    const foundBtn = document.getElementById("foundBtn");
    const viewBtn = document.getElementById("viewBtn");

    const backDashboard = document.getElementById("backDashboard");
    const backFromFound = document.getElementById("backFromFound");
    const backFromItems = document.getElementById("backFromItems");

    const lostCount = document.getElementById("lostCount");
    const foundCount = document.getElementById("foundCount");
    const returnedCount = document.getElementById("returnedCount");

    const lostItemForm = document.getElementById("lostItemForm");
    const foundItemForm = document.getElementById("foundItemForm");

    const itemsList = document.getElementById("itemsList");
    const matchesList = document.getElementById("matchesList");

    const searchItems = document.getElementById("searchItems");
    const itemFilter = document.getElementById("itemFilter");


    // =================================
    // 2. STORE DATA
    // =================================

    let items = JSON.parse(localStorage.getItem("lostFoundItems")) || [];

    if (!Array.isArray(items)) {
        items = [];
    }

    let currentUserEmail = "";
    let currentUserName = "";

    let lostImageData = "";
    let foundImageData = "";

    function saveItems() {
        localStorage.setItem("lostFoundItems", JSON.stringify(items));
    }


    // =================================
    // 3. HELPER FUNCTIONS
    // =================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const characters = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return characters[character];
        });
    }

    function getField(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    }

    function createId() {
        return Date.now().toString() +
            Math.random().toString(36).slice(2);
    }


    // =================================
    // 4. PAGE NAVIGATION
    // =================================

    function showPage(page) {

        const pages = [
            loginBox,
            registerBox,
            dashboard,
            lostForm,
            foundForm,
            viewItemsPage
        ];

        pages.forEach(function (element) {
            if (element) {
                element.style.display = "none";
            }
        });

        if (page) {
            page.style.display = "block";
        }
    }


    // =================================
    // 5. LOGIN / REGISTER SWITCH
    // =================================

    if (showRegister) {
        showRegister.addEventListener("click", function () {
            showPage(registerBox);

            if (registerMessage) {
                registerMessage.textContent = "";
            }
        });
    }

    if (showLogin) {
        showLogin.addEventListener("click", function () {
            showPage(loginBox);

            if (loginMessage) {
                loginMessage.textContent = "";
            }
        });
    }


    // =================================
    // 6. REGISTER
    // =================================

    if (registerBtn) {
        registerBtn.addEventListener("click", function () {

            const name = getField("registerName");
            const email = getField("registerEmail");
            const password = getField("registerPassword");
            const confirm = getField("confirmPassword");

            if (!name || !email || !password || !confirm) {
                registerMessage.textContent = "Please fill all fields.";
                return;
            }

            if (password !== confirm) {
                registerMessage.textContent = "Passwords do not match.";
                return;
            }

            localStorage.setItem("registeredName", name);
            localStorage.setItem("registeredEmail", email.toLowerCase());

            registerMessage.textContent =
                "Registration successful! Please login.";

            document.getElementById("registerName").value = "";
            document.getElementById("registerEmail").value = "";
            document.getElementById("registerPassword").value = "";
            document.getElementById("confirmPassword").value = "";
        });
    }


    // =================================
    // 7. LOGIN
    // =================================

    if (loginBtn) {
        loginBtn.addEventListener("click", function () {

            const email = getField("loginEmail").toLowerCase();
            const password = getField("loginPassword");

            if (!email || !password) {
                loginMessage.textContent =
                    "Please enter email and password.";
                return;
            }

            currentUserEmail = email;

            const savedEmail =
                localStorage.getItem("registeredEmail") || "";

            const savedName =
                localStorage.getItem("registeredName") || "";

            if (savedEmail === email && savedName) {
                currentUserName = savedName;
            } else {
                currentUserName = email.split("@")[0] || "User";
            }

            showPage(dashboard);
            updateStatistics();
        });
    }


    // =================================
    // 8. DASHBOARD NAVIGATION
    // =================================

    if (lostBtn) {
        lostBtn.addEventListener("click", function () {
            showPage(lostForm);
        });
    }

    if (foundBtn) {
        foundBtn.addEventListener("click", function () {
            showPage(foundForm);
        });
    }

    if (viewBtn) {
        viewBtn.addEventListener("click", function () {
            showPage(viewItemsPage);
            displayItems();
        });
    }

    if (backDashboard) {
        backDashboard.addEventListener("click", function () {
            showPage(dashboard);
        });
    }

    if (backFromFound) {
        backFromFound.addEventListener("click", function () {
            showPage(dashboard);
        });
    }

    if (backFromItems) {
        backFromItems.addEventListener("click", function () {
            showPage(dashboard);
        });
    }


    // =================================
    // 9. IMAGE PREVIEW
    // =================================

    function setupImagePreview(inputId, previewId, type) {

        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);

        if (!input || !preview) return;

        input.addEventListener("change", function () {

            const file = input.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select an image file.");
                input.value = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {

                if (type === "lost") {
                    lostImageData = event.target.result;
                } else {
                    foundImageData = event.target.result;
                }

                preview.innerHTML = `
                    <img
                        src="${event.target.result}"
                        alt="Selected item image"
                        class="item-image"
                    >
                `;

                preview.style.display = "block";
            };

            reader.readAsDataURL(file);
        });
    }

    setupImagePreview("lostImage", "lostImagePreview", "lost");
    setupImagePreview("foundImage", "foundImagePreview", "found");


    // =================================
    // 10. REPORT LOST ITEM
    // =================================

    if (lostItemForm) {

        lostItemForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const item = {
                id: createId(),
                type: "lost",

                // Correct HTML IDs
                name: getField("itemName"),
                category: getField("itemCategory"),
                description: getField("itemDescription"),
                location: getField("lostLocation"),
                date: getField("lostDate"),

                image: lostImageData,
                status: "active",
                ownerEmail: currentUserEmail,
                ownerName: currentUserName,
                createdAt: new Date().toISOString()
            };

            if (
                !item.name ||
                !item.category ||
                !item.description ||
                !item.location ||
                !item.date
            ) {
                alert("Please fill all required fields.");
                return;
            }

            items.push(item);

            saveItems();
            updateStatistics();

            lostItemForm.reset();
            lostImageData = "";

            const preview =
                document.getElementById("lostImagePreview");

            if (preview) {
                preview.innerHTML = "";
                preview.style.display = "none";
            }

            alert("Lost item reported successfully!");

            showPage(dashboard);
        });
    }


    // =================================
    // 11. REPORT FOUND ITEM
    // =================================

    if (foundItemForm) {

        foundItemForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const item = {
                id: createId(),
                type: "found",

                // Correct HTML IDs
                name: getField("foundItemName"),
                category: getField("foundCategory"),
                description: getField("foundDescription"),
                location: getField("foundLocation"),
                date: getField("foundDate"),

                image: foundImageData,
                status: "active",
                ownerEmail: currentUserEmail,
                ownerName: currentUserName,
                createdAt: new Date().toISOString()
            };

            if (
                !item.name ||
                !item.category ||
                !item.description ||
                !item.location ||
                !item.date
            ) {
                alert("Please fill all required fields.");
                return;
            }

            items.push(item);

            saveItems();
            updateStatistics();

            foundItemForm.reset();
            foundImageData = "";

            const preview =
                document.getElementById("foundImagePreview");

            if (preview) {
                preview.innerHTML = "";
                preview.style.display = "none";
            }

            alert("Found item reported successfully!");

            showPage(dashboard);
        });
    }


    // =================================
    // 12. DISPLAY ALL ITEMS
    // =================================

    function displayItems() {

        if (!itemsList) return;

        const searchText = searchItems
            ? searchItems.value.trim().toLowerCase()
            : "";

        const filter = itemFilter
            ? itemFilter.value.toLowerCase()
            : "all";

        const filteredItems = items.filter(function (item) {

            const matchesFilter =
                filter === "all" || item.type === filter;

            const searchableText = [
                item.name,
                item.category,
                item.description,
                item.location
            ].join(" ").toLowerCase();

            const matchesSearch =
                searchableText.includes(searchText);

            return matchesFilter && matchesSearch;
        });

        if (filteredItems.length === 0) {
            itemsList.innerHTML = "<p>No items found.</p>";
            displayMatches();
            return;
        }

        itemsList.innerHTML = filteredItems.map(function (item) {

            const isOwner =
                item.ownerEmail === currentUserEmail;

            return `
                <div class="item-card ${item.type}">

                    ${item.image ? `
                        <img
                            src="${escapeHTML(item.image)}"
                            alt="Item image"
                            class="item-image"
                        >
                    ` : ""}

                    <h3>${escapeHTML(item.name)}</h3>

                    <p><strong>Type:</strong>
                        ${escapeHTML(item.type)}
                    </p>

                    <p><strong>Category:</strong>
                        ${escapeHTML(item.category)}
                    </p>

                    <p><strong>Description:</strong>
                        ${escapeHTML(item.description)}
                    </p>

                    <p><strong>Location:</strong>
                        ${escapeHTML(item.location)}
                    </p>

                    <p><strong>Date:</strong>
                        ${escapeHTML(item.date)}
                    </p>

                    <p><strong>Status:</strong>
                        ${escapeHTML(item.status || "active")}
                    </p>

                    <p><strong>Reported by:</strong>
                        ${escapeHTML(item.ownerName || "User")}
                    </p>

                    ${isOwner && item.type === "found" &&
                    item.status !== "returned" ? `
                        <button onclick="markReturned('${item.id}')">
                            Mark as Returned
                        </button>
                    ` : ""}

                    ${isOwner ? `
                        <button onclick="editItem('${item.id}')">
                            Edit
                        </button>

                        <button onclick="deleteItem('${item.id}')">
                            Delete
                        </button>
                    ` : ""}

                </div>
            `;

        }).join("");

        displayMatches();
    }


    // =================================
    // 13. DELETE ITEM
    // =================================

    window.deleteItem = function (id) {

        const item = items.find(item => item.id === id);

        if (!item) return;

        if (item.ownerEmail !== currentUserEmail) {
            alert("You can delete only your own reported items.");
            return;
        }

        if (confirm("Are you sure you want to delete this item?")) {

            items = items.filter(item => item.id !== id);

            saveItems();
            updateStatistics();
            displayItems();
        }
    };


    // =================================
    // 14. EDIT ITEM
    // =================================

    window.editItem = function (id) {

        const item = items.find(item => item.id === id);

        if (!item) return;

        if (item.ownerEmail !== currentUserEmail) {
            alert("You can edit only your own reported items.");
            return;
        }

        const newName = prompt("Enter item name:", item.name);

        if (newName === null || newName.trim() === "") return;

        const newLocation = prompt("Enter location:", item.location);

        if (newLocation === null || newLocation.trim() === "") return;

        const newDescription = prompt(
            "Enter description:",
            item.description
        );

        if (newDescription === null || newDescription.trim() === "") return;

        item.name = newName.trim();
        item.location = newLocation.trim();
        item.description = newDescription.trim();

        saveItems();
        updateStatistics();
        displayItems();

        alert("Item updated successfully!");
    };


    // =================================
    // 15. MARK FOUND ITEM AS RETURNED
    // =================================

    window.markReturned = function (id) {

        const item = items.find(item => item.id === id);

        if (!item) return;

        if (item.type !== "found") return;

        if (item.ownerEmail !== currentUserEmail) {
            alert("Only the reporter can update this item's status.");
            return;
        }

        item.status = "returned";

        saveItems();
        updateStatistics();
        displayItems();

        alert("Item marked as returned!");
    };


    // =================================
    // 16. SEARCH AND FILTER
    // =================================

    if (searchItems) {
        searchItems.addEventListener("input", displayItems);
    }

    if (itemFilter) {
        itemFilter.addEventListener("change", displayItems);
    }


    // =================================
    // 17. MATCH LOST AND FOUND ITEMS
    // =================================

    function displayMatches() {

        if (!matchesList) return;

        const lostItems = items.filter(item =>
            item.type === "lost" && item.status !== "returned"
        );

        const foundItems = items.filter(item =>
            item.type === "found" && item.status !== "returned"
        );

        let matches = [];

        lostItems.forEach(function (lost) {

            foundItems.forEach(function (found) {

                let score = 0;

                if (
                    (lost.name || "").toLowerCase() ===
                    (found.name || "").toLowerCase()
                ) {
                    score += 40;
                }

                if (
                    (lost.category || "").toLowerCase() ===
                    (found.category || "").toLowerCase()
                ) {
                    score += 25;
                }

                if (
                    (lost.location || "").toLowerCase() ===
                    (found.location || "").toLowerCase()
                ) {
                    score += 20;
                }

                const lostWords =
                    (lost.description || "").toLowerCase().split(/\s+/);

                const foundWords =
                    (found.description || "").toLowerCase().split(/\s+/);

                const commonWords = lostWords.filter(word =>
                    word.length > 2 && foundWords.includes(word)
                );

                if (commonWords.length > 0) {
                    score += 15;
                }

                if (score >= 40) {
                    matches.push({
                        lost: lost,
                        found: found,
                        score: score
                    });
                }
            });
        });

        if (matches.length === 0) {
            matchesList.innerHTML =
                "<p>No possible matches found yet.</p>";
            return;
        }

        matchesList.innerHTML = matches.map(function (match) {

            return `
                <div class="match-card">

                    <h3>Possible Match Found!</h3>

                    <p><strong>Lost Item:</strong>
                        ${escapeHTML(match.lost.name)}
                    </p>

                    <p><strong>Found Item:</strong>
                        ${escapeHTML(match.found.name)}
                    </p>

                    <p><strong>Matching Score:</strong>
                        ${match.score}%
                    </p>

                    <p><strong>Found Location:</strong>
                        ${escapeHTML(match.found.location)}
                    </p>

                </div>
            `;

        }).join("");
    }


    // =================================
    // 18. UPDATE DASHBOARD STATISTICS
    // =================================

    function updateStatistics() {

        const lost = items.filter(item =>
            item.type === "lost"
        ).length;

        const found = items.filter(item =>
            item.type === "found"
        ).length;

        const returned = items.filter(item =>
            item.status === "returned"
        ).length;

        if (lostCount) lostCount.textContent = lost;
        if (foundCount) foundCount.textContent = found;
        if (returnedCount) returnedCount.textContent = returned;

        displayMatches();
    }


    // =================================
    // 19. INITIAL PAGE
    // =================================

    showPage(loginBox);
    updateStatistics();

});
