(() => {
    const contentUrl = new URL("content/site.json", document.baseURI);

    const resolveSiteAsset = (path, fallback) => {
        const value = typeof path === "string" && path.trim() ? path.trim() : fallback;
        if (!value) return "";
        if (/^(?:https?:|data:|blob:)/i.test(value)) return value;
        return new URL(value.replace(/^\/+/, ""), document.baseURI).href;
    };

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element && typeof value === "string" && value.trim()) {
            element.textContent = value.trim();
        }
    };

    const renderGames = (games) => {
        const container = document.getElementById("game-tags");
        if (!container || !Array.isArray(games)) return;

        container.replaceChildren(...games.filter(Boolean).map((game) => {
            const tag = document.createElement("span");
            tag.textContent = game;
            return tag;
        }));
    };

    const renderCharacters = (characters) => {
        const container = document.getElementById("character-list");
        if (!container || !Array.isArray(characters)) return;

        const cards = characters.map((character) => {
            const article = document.createElement("article");
            article.className = "mini-character";

            const imageWrap = document.createElement("div");
            imageWrap.className = "mini-character-image";
            const image = document.createElement("img");
            image.src = resolveSiteAsset(character.image, "assets/images/uploads/profile.webp");
            image.alt = character.name || "Favourite character";
            image.loading = "lazy";
            imageWrap.append(image);

            const copy = document.createElement("div");
            const name = document.createElement("h3");
            name.textContent = character.name || "Unnamed character";
            const game = document.createElement("p");
            game.textContent = character.game || "";
            copy.append(name, game);

            article.append(imageWrap, copy);
            return article;
        });

        container.replaceChildren(...cards);
    };

    const renderPosts = (posts) => {
        const container = document.getElementById("posts-list");
        if (!container || !Array.isArray(posts)) return;

        if (posts.length === 0) {
            const message = document.createElement("p");
            message.className = "empty-posts";
            message.textContent = "Future posts will be uploaded here :)";
            container.replaceChildren(message);
            return;
        }

        const articles = posts.map((post) => {
            const article = document.createElement("article");
            article.className = "featured-post";

            const copy = document.createElement("div");
            copy.className = "post-copy";
            const date = document.createElement("p");
            date.className = "post-date";
            date.textContent = post.date ? `Post · ${post.date}` : "Post";
            const title = document.createElement("h3");
            title.textContent = post.title || "Untitled post";
            const body = document.createElement("p");
            body.textContent = post.body || "";
            copy.append(date, title, body);

            if (post.image) {
                const image = document.createElement("img");
                image.src = resolveSiteAsset(post.image);
                image.alt = post.imageAlt || post.title || "Post image";
                image.loading = "lazy";
                article.append(copy, image);
            } else {
                article.append(copy);
                article.classList.add("featured-post--text-only");
            }

            return article;
        });

        container.replaceChildren(...articles);
    };

    const renderProfile = (profile) => {
        if (!profile || typeof profile !== "object") return;

        setText("profile-title", profile.name);
        setText("profile-description", profile.description);

        const profileImage = document.getElementById("profile-image");
        if (profileImage) {
            profileImage.src = resolveSiteAsset(profile.image, "assets/images/uploads/profile.webp");
            profileImage.alt = `${profile.name || "Streaky"}'s profile picture`;
        }

        const banner = document.getElementById("profile-banner");
        if (banner) {
            banner.src = resolveSiteAsset(profile.banner, "assets/images/uploads/banner.webp");
        }

        if (/^#[0-9a-f]{6}$/i.test(profile.ringColor || "")) {
            document.documentElement.style.setProperty("--profile-ring-color", profile.ringColor);
            document.documentElement.style.setProperty("--profile-ring-soft", `${profile.ringColor}2e`);
        }
    };

    const setupSectionNavigation = () => {
        const links = [...document.querySelectorAll('.page-nav a[href^="#"]')];
        let clearTimer;

        const highlight = (target, link) => {
            if (!target) return;
            document.querySelectorAll(".nav-target.is-highlighted").forEach((section) => {
                section.classList.remove("is-highlighted");
            });
            links.forEach((item) => {
                item.classList.toggle("is-active", item === link);
                if (item === link) item.setAttribute("aria-current", "location");
                else item.removeAttribute("aria-current");
            });

            window.clearTimeout(clearTimer);
            void target.offsetWidth;
            target.classList.add("is-highlighted");
            clearTimer = window.setTimeout(() => target.classList.remove("is-highlighted"), 1800);
        };

        links.forEach((link) => {
            const selector = link.getAttribute("href");
            const target = selector ? document.querySelector(selector) : null;
            if (!target) return;
            target.classList.add("nav-target");

            link.addEventListener("click", (event) => {
                event.preventDefault();
                const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                window.history.pushState(null, "", selector);
                target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
                highlight(target, link);
            });
        });

        if (window.location.hash) {
            const initialLink = links.find((link) => link.getAttribute("href") === window.location.hash);
            const initialTarget = document.querySelector(window.location.hash);
            window.setTimeout(() => highlight(initialTarget, initialLink), 250);
        }
    };

    const loadContent = async () => {
        try {
            const response = await fetch(contentUrl, { cache: "no-store" });
            if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
            const content = await response.json();
            renderProfile(content.profile || {
                name: content.name,
                description: content.description
            });
            renderGames(content.games);
            renderCharacters(content.characters);
            renderPosts(content.posts);
        } catch (error) {
            console.warn("Using the page's built-in content.", error);
        }
    };

    const setupIdentityRedirect = () => {
        if (!window.netlifyIdentity) return;
        window.netlifyIdentity.on("init", (user) => {
            if (!user) {
                window.netlifyIdentity.on("login", () => {
                    window.location.assign(new URL("admin/", document.baseURI));
                });
            }
        });
    };

    loadContent();
    setupIdentityRedirect();
    setupSectionNavigation();
})();
