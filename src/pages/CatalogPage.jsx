import React from "react";
import { CartSummaryAside } from "../components/cart/CartSummaryAside.jsx";
import { CatalogToolbar } from "../components/catalog/CatalogToolbar.jsx";
import { PaginationBar } from "../components/catalog/PaginationBar.jsx";
import { FilterSidebar } from "../components/filters/FilterSidebar.jsx";
import { AnnouncementBanner } from "../components/layout/AnnouncementBanner.jsx";
import { Breadcrumbs } from "../components/layout/Breadcrumbs.jsx";
import { SiteFooter } from "../components/layout/SiteFooter.jsx";
import { SiteHeader } from "../components/layout/SiteHeader.jsx";
import { HeroSpotlight } from "../components/product/HeroSpotlight.jsx";
import { ProductGrid } from "../components/product/ProductGrid.jsx";
import { LocaleContext } from "../context/LocaleContext.js";
import { ThemeContext } from "../context/ThemeContext.js";
import { cx } from "../lib/classNames.js";
import { getThemePalette } from "../lib/theme.js";

// The catalog listing page: promo banner, header, breadcrumbs, then filters | products | quote.
export function CatalogPage(props) {
  var data = props.data;
  var theme = React.useContext(ThemeContext);
  var locale = React.useContext(LocaleContext);
  var palette = getThemePalette(theme);
  return (
    <div
      id="northstar-app"
      className={cx("ns-shell", "ns-theme-" + theme, {
        "ns-compact": Boolean(data.compactMode),
      })}
      data-theme={theme}
      data-locale={locale.code}
      data-request-id={data.requestId}
      style={{
        backgroundColor: palette.bg,
        color: palette.fg,
        minHeight: "100vh",
      }}
    >
      <AnnouncementBanner promo={data.promo} />
      <SiteHeader search={data.search} categories={data.categories} />
      <Breadcrumbs breadcrumbs={data.breadcrumbs} />
      <div className="ns-layout">
        <FilterSidebar
          filters={data.filters}
          inStockOnly={data.search.inStockOnly}
        />
        <main className="ns-main">
          <HeroSpotlight spotlight={data.spotlight} />
          <CatalogToolbar
            stats={props.stats}
            totalMatching={data.pagination.totalMatching}
            sortBy={data.search.sortBy}
          />
          <ProductGrid
            products={data.products}
            query={data.search.query}
          />
          <PaginationBar pagination={data.pagination} />
        </main>
        <CartSummaryAside cart={data.cart} />
      </div>
      <SiteFooter timestampSec={data.timestampSec} />
    </div>
  );
}
