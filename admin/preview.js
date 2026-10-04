(() => {
    const getData = (entry) => {
        const data = entry.getIn(["data"]);
        return data && typeof data.toJS === "function" ? data.toJS() : {};
    };

    const resolveAsset = (path, getAsset) => {
        if (!path) return "";

        try {
            const asset = getAsset(path);
            return asset && typeof asset.toString === "function" ? asset.toString() : String(asset || path);
        } catch (_error) {
            return path;
        }
    };

    const element = (tag, props, ...children) => h(tag, props, ...children);

    const SiteContentPreview = createClass({
        render() {
            const data = getData(this.props.entry);
            const games = Array.isArray(data.games) ? data.games : [];
            const characters = Array.isArray(data.characters) ? data.characters : [];
            const posts = Array.isArray(data.posts) ? data.posts : [];

            return element(
                "main",
                { className: "cms-preview" },
                element(
                    "section",
                    { className: "cms-preview__profile" },
                    element("p", { className: "cms-preview__eyebrow" }, "Profile preview"),
                    element("h1", null, data.name || "Streaky :3"),
                    element("p", { className: "cms-preview__description" }, data.description || "Quick description"),
                    element("h2", null, "Currently playing"),
                    element(
                        "div",
                        { className: "cms-preview__tags" },
                        ...games.map((game, index) => element("span", { key: `${game}-${index}` }, game))
                    )
                ),
                element(
                    "section",
                    { className: "cms-preview__section" },
                    element("h2", null, "Favourite characters"),
                    element(
                        "div",
                        { className: "cms-preview__characters" },
                        ...characters.map((character, index) => element(
                            "article",
                            { className: "cms-preview__character", key: `${character.name}-${index}` },
                            element("img", {
                                src: resolveAsset(character.image, this.props.getAsset),
                                alt: character.name || "Favourite character"
                            }),
                            element(
                                "div",
                                null,
                                element("h3", null, character.name || "Unnamed character"),
                                element("p", null, character.game || "")
                            )
                        ))
                    )
                ),
                element(
                    "section",
                    { className: "cms-preview__section" },
                    element("h2", null, "Posts"),
                    posts.length
                        ? element(
                            "div",
                            { className: "cms-preview__posts" },
                            ...posts.map((post, index) => element(
                                "article",
                                { className: "cms-preview__post", key: `${post.title}-${index}` },
                                post.image
                                    ? element("img", {
                                        src: resolveAsset(post.image, this.props.getAsset),
                                        alt: post.imageAlt || post.title || "Post image"
                                    })
                                    : null,
                                element(
                                    "div",
                                    null,
                                    element("p", { className: "cms-preview__date" }, post.date ? `Post · ${post.date}` : "Post"),
                                    element("h3", null, post.title || "Untitled post"),
                                    element("p", null, post.body || "")
                                )
                            ))
                        )
                        : element("p", { className: "cms-preview__empty" }, "Future posts will be uploaded here :)")
                )
            );
        }
    });

    CMS.registerPreviewStyle("preview.css");
    CMS.registerPreviewTemplate("site_content", SiteContentPreview);
})();
