import React from "react";
import { AnnouncementBanner } from "../components/layout/AnnouncementBanner.jsx";
import { Breadcrumbs } from "../components/layout/Breadcrumbs.jsx";
import { FlashMessage } from "../components/layout/FlashMessage.jsx";
import { SiteFooter } from "../components/layout/SiteFooter.jsx";
import { SiteHeader } from "../components/layout/SiteHeader.jsx";
import { LocaleContext } from "../context/LocaleContext.js";
import { NavContext } from "../context/NavContext.js";
import { ThemeContext } from "../context/ThemeContext.js";
import { UserContext } from "../context/UserContext.js";
import { computeCartTotals } from "../lib/cart.js";
import { computeCatalogStats } from "../lib/catalog.js";
import { CartPage } from "./CartPage.jsx";
import { HomePage } from "./HomePage.jsx";
import { ListingPage } from "./ListingPage.jsx";
import { NotFoundPage } from "./NotFoundPage.jsx";
import { ProductPage } from "./ProductPage.jsx";
import { SignInPage } from "./SignInPage.jsx";

// Page shell: promo bar, header, flash message, breadcrumbs, the current view, footer.
export function StorePage(props) {
  var data = props.data;
  var theme = React.useContext(ThemeContext);
  var locale = React.useContext(LocaleContext);
  var nav = React.useContext(NavContext);
  var user = React.useContext(UserContext);
  var cart = data.cart;
  var totals = React.useMemo(
    function () {
      return computeCartTotals(cart, user);
    },
    [cart, user]
  );
  // Computed here rather than in ListingPage: the revived Prepack cannot specialize a list whose
  // array was already walked by a loop inside the same conditional branch.
  var products = data.products;
  var stats = React.useMemo(
    function () {
      return computeCatalogStats(products);
    },
    [products]
  );
  var view = nav.view;
  return (
    <div
      id="northstar-app"
      className={"ns-shell ns-theme-" + theme}
      data-theme={theme}
      data-locale={locale.code}
      data-view={view}
    >
      <a className="ns-skip" href="#ns-main">
        Skip to content
      </a>
      <AnnouncementBanner promo={data.promo} />
      <SiteHeader
        search={data.search}
        categories={data.categories}
        cartCount={totals.unitCount}
      />
      <main className="ns-main" id="ns-main">
        <FlashMessage flash={data.flash} />
        <Breadcrumbs breadcrumbs={data.breadcrumbs} />
        {view === "home" && data.home ? (
          <HomePage home={data.home} products={data.products} categories={data.categories} cart={cart} />
        ) : view === "listing" && data.listing ? (
          <ListingPage
            listing={data.listing}
            products={data.products}
            stats={stats}
            filters={data.filters}
            activeFilters={data.activeFilters}
            search={data.search}
            categories={data.categories}
          />
        ) : view === "product" && data.product ? (
          <ProductPage product={data.product} specs={data.specs} related={data.products} cart={cart} />
        ) : view === "cart" ? (
          <CartPage cart={cart} totals={totals} />
        ) : view === "signin" ? (
          <SignInPage />
        ) : (
          <NotFoundPage categories={data.categories} />
        )}
      </main>
      <SiteFooter categories={data.categories} />
    </div>
  );
}
