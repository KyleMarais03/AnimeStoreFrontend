import React from "react";

function Designs() {
    const designs = [
        { id: 1, name: "Naruto Streetwear", img: "/img/design-naruto.jpg" },
        { id: 2, name: "One Piece Pirate Crew", img: "/img/design-onepiece.jpg" },
        { id: 3, name: "Attack on Titan Wings", img: "/img/design-aot.jpg" },
        { id: 4, name: "Demon Slayer Flames", img: "/img/design-demonslayer.jpg" },
        { id: 5, name: "Jujutsu Kaisen Cursed Energy", img: "/img/design-jujutsu.jpg" },
        { id: 6, name: "Dragon Ball Z Saiyan Aura", img: "/img/design-dbz.jpg" },
    ];

    return (
        <div className="container py-5">
            <h1 className="fw-bold text-center mb-5">🎨 Anime Designs</h1>
            <p className="text-center text-muted mb-4">
                Explore unique anime-inspired designs made for true fans.
                Pick your favorite and make it yours!
            </p>

            <div className="row g-4">
                {designs.map((d) => (
                    <div key={d.id} className="col-md-6 col-lg-4">
                        <div className="card shadow-lg border-0 h-100">
                            <img src={d.img} alt={d.name} className="card-img-top" />
                            <div className="card-body text-center">
                                <h5 className="card-title">{d.name}</h5>
                                <button className="btn btn-warning btn-sm">
                                    <i className="bi bi-heart me-1"></i> Add to Favorites
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Designs;
