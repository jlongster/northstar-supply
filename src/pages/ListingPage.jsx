import React from "react";
import { CatalogToolbar } from "../components/catalog/CatalogToolbar.jsx";
import { PaginationBar } from "../components/catalog/PaginationBar.jsx";
import { FilterSidebar } from "../components/filters/FilterSidebar.jsx";
import { EmptyCatalogState } from "../components/product/EmptyCatalogState.jsx";
import { ProductGrid } from "../components/product/ProductGrid.jsx";

// All products, a category, or search results: header, filters | toolbar + grid + pagination.
export function ListingPage(props) {
  var listing = props.listing;
  var search = props.search;
  var products = props.products;
  var activeFilters = props.activeFilters;
  return (
    <div className="ns-listing ns-container" data-kind={listing.kind}>
      <header className="ns-page-head">
        <h1 className="ns-page-title">{listing.title}</h1>
        {listing.description ? <p className="ns-page-desc">{listing.description}</p> : null}
      </header>
      <div className="ns-layout">
        <FilterSidebar
          filters={props.filters}
          inStockOnly={search.inStockOnly}
          query={listing.kind === "search" ? search.query : ""}
          activeCount={activeFilters.length}
          clearHref={listing.clearHref}
        />
        <div className="ns-results">
          <CatalogToolbar
            stats={props.stats}
            pagination={listing.pagination}
            sortBy={search.sortBy}
            activeFilters={activeFilters}
          />
          {products.length === 0 ? (
            <EmptyCatalogState
              query={search.query}
              hasFilters={activeFilters.length > 0}
              clearHref={listing.clearHref}
              categories={props.categories}
            />
          ) : (
            <ProductGrid products={products} />
          )}
          <PaginationBar pagination={listing.pagination} />
        </div>
      </div>
    </div>
  );
}
