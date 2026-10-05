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
            const profile = data.profile || {
                name: data.name,
                description: data.description
            };
            const games = Array.isArray(data.games) ? data.games : [];
            const characters = Array.isArray(data.characters) ? data.characters : [];
            const posts = Array.isArray(data.posts) ? data.posts : [];
            const profileImage = resolveAsset(profile.image, this.props.getAsset);
            const bannerImage = resolveAsset(profile.banner, this.props.getAsset);

            return element(
                "main",
                {
                    className: "cms-site-preview",
                    style: { "--preview-ring": profile.ringColor || "#775743" }
                },
                element(
                    "header",
                    { className: "cms-site-preview__header" },
                    element("span", { className: "cms-site-preview__brand" }, "streaky", element("b", null, "•")),
                    element("span", null, "Live content preview")
                ),
                element(
                    "div",
                    { className: "cms-site-preview__banner" },
                    bannerImage
                        ? element("img", { src: bannerImage, alt: "Profile banner preview" })
                        : element("span", null, "Choose a top banner")
                ),
                element(
                    "div",
                    { className: "cms-site-preview__layout" },
                    element(
                        "aside",
                        { className: "cms-site-preview__sidebar" },
                        element(
                            "div",
                            { className: "cms-site-preview__avatar" },
                            profileImage
                                ? element("img", { src: profileImage, alt: "Profile picture preview" })
                                : element("span", null, "Add photo")
                        ),
                        element("h1", null, profile.name || "Streaky :3"),
                        element("p", { className: "cms-site-preview__meta" }, "Streaky  |  He/Him  |  Taurus  |  Gambler"),
                        element("p", { className: "cms-site-preview__description" }, profile.description || "Quick description"),
                        element("h2", null, "Currently playing"),
                        element(
                            "div",
                            { className: "cms-site-preview__tags" },
                            ...games.map((game, index) => element("span", { key: `${game}-${index}` }, game))
                        ),
                        element("h2", null, "Favourite characters"),
                        element(
                            "div",
                            { className: "cms-site-preview__characters" },
                            ...characters.map((character, index) => element(
                                "article",
                                { className: "cms-site-preview__character", key: `${character.name}-${index}` },
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
                        "div",
                        { className: "cms-site-preview__main" },
                        element(
                            "section",
                            { className: "cms-site-preview__intro" },
                            element("p", { className: "cms-site-preview__eyebrow" }, "A little introduction"),
                            element("h2", null, "Layout"),
                            element("p", null, "This layout features my favourite characters from various games and my progress in games.")
                        ),
                        element(
                            "section",
                            null,
                            element("h2", null, "Posts"),
                            posts.length
                                ? element(
                                    "div",
                                    { className: "cms-site-preview__posts" },
                                    ...posts.map((post, index) => element(
                                        "article",
                                        { className: "cms-site-preview__post", key: `${post.title}-${index}` },
                                        element(
                                            "div",
                                            null,
                                            element("p", { className: "cms-site-preview__date" }, post.date ? `Post · ${post.date}` : "Post"),
                                            element("h3", null, post.title || "Untitled post"),
                                            element("p", null, post.body || "")
                                        ),
                                        post.image
                                            ? element("img", {
                                                src: resolveAsset(post.image, this.props.getAsset),
                                                alt: post.imageAlt || post.title || "Post image"
                                            })
                                            : null
                                    ))
                                )
                                : element("p", { className: "cms-site-preview__empty" }, "Future posts will be uploaded here :)")
                        ),
                        element(
                            "section",
                            null,
                            element("p", { className: "cms-site-preview__eyebrow" }, "Open inbox"),
                            element("h2", null, "Contact"),
                            element("p", null, "Want to talk about games, art, or a project? Find me through the links above.")
                        )
                    )
                )
            );
        }
    });

    CMS.registerPreviewStyle("preview.css");
    CMS.registerPreviewTemplate("site_content", SiteContentPreview);
})();
