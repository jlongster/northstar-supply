import React from "react";
import { CategoryTiles } from "../components/home/CategoryTiles.jsx";
import { HeroSpotlight } from "../components/home/HeroSpotlight.jsx";
import { ValueProps } from "../components/home/ValueProps.jsx";
import { ProductGrid } from "../components/product/ProductGrid.jsx";
import { NavContext } from "../context/NavContext.js";

export function HomePage(props) {
  var nav = React.useContext(NavContext);
  var home = props.home;
  return (
    <div className="ns-home">
      <section className="ns-hero ns-container">
        <div className="ns-hero-copy">
          <p className="ns-eyebrow">Industrial supply for working shops</p>
          <h1 className="ns-hero-title">Professional tools, shipped next day.</h1>
          <p className="ns-hero-lede">
            Measuring instruments, hand and power tools, cutting tools and safety gear from
            brands that hold tolerance. Trade pricing for teams, no minimum order.
          </p>
          <div className="ns-hero-actions">
            <a className="ns-btn ns-btn-primary ns-btn-lg" href={nav.base + "/shop"}>
              Shop all products
            </a>
            <a className="ns-btn ns-btn-secondary ns-btn-lg" href={nav.base + "/signin"}>
              Open a trade account
            </a>
          </div>
        </div>
        <HeroSpotlight spotlight={home.spotlight} />
      </section>
      <section className="ns-section ns-container" aria-labelledby="ns-cats-title">
        <div className="ns-section-head">
          <h2 className="ns-section-heading" id="ns-cats-title">
            Shop by category
          </h2>
        </div>
        <CategoryTiles categories={props.categories} />
      </section>
      <section className="ns-section ns-container" aria-labelledby="ns-featured-title">
        <div className="ns-section-head">
          <h2 className="ns-section-heading" id="ns-featured-title">
            Best sellers
          </h2>
          <a className="ns-section-link" href={nav.base + "/shop"}>
            View all products
          </a>
        </div>
        <ProductGrid products={props.products} compact={true} />
      </section>
      <section className="ns-section ns-container" aria-label="Why Northstar">
        <ValueProps freeShippingThreshold={props.cart.freeShippingThreshold} />
      </section>
    </div>
  );
}
