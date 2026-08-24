import type { NormalizedEvent } from "./types.js";
import { loadData, normalizeData } from "./data.js";
import { applyFilters, uniqueTypes, type FilterState } from "./filters.js";
import { getRenderRefs, renderTimeline } from "./render.js";
import { EventDialog } from "./dialog.js";
import { colorForType, labelForType } from "./colors.js";
import data from './data/data-real.json';

function eventIdFromHash(): string | null {
    const match = /^#event\/(.+)$/.exec(window.location.hash);
    return match ? decodeURIComponent(match[1]) : null;
}

async function main(): Promise<void> {
    const loadingState = document.getElementById(
        "loading-state",
    ) as HTMLElement;
    const searchInput = document.getElementById(
        "search-input",
    ) as HTMLInputElement;
    const typeFiltersEl = document.getElementById(
        "type-filters",
    ) as HTMLElement;
    const refs = getRenderRefs();

    let allEvents: NormalizedEvent[] = [];
    const filters: FilterState = { search: "", activeTypes: new Set() };

    const dialog = new EventDialog(() => {
        if (window.location.hash.startsWith("#event/")) {
            history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search,
            );
        }
    });

    function openEvent(event: NormalizedEvent): void {
        history.pushState(null, "", `#event/${event.id}`);
        dialog.open(event);
    }

    function rerender(): void {
        const filtered = applyFilters(allEvents, filters);
        renderTimeline(refs, filtered, openEvent);
    }

    function buildTypeChips(): void {
        typeFiltersEl.innerHTML = "";
        uniqueTypes(allEvents).forEach((type) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "chip";
            chip.textContent = labelForType(type);
            chip.style.setProperty("--chip-color", colorForType(type));
            chip.setAttribute("aria-pressed", "false");
            chip.addEventListener("click", () => {
                const active = filters.activeTypes.has(type);
                if (active) {
                    filters.activeTypes.delete(type);
                } else {
                    filters.activeTypes.add(type);
                }
                chip.setAttribute("aria-pressed", String(!active));
                rerender();
            });
            typeFiltersEl.appendChild(chip);
        });
    }

    searchInput.addEventListener("input", () => {
        filters.search = searchInput.value;
        rerender();
    });

    window.addEventListener("popstate", () => {
        const id = eventIdFromHash();
        if (id) {
            const found = allEvents.find((e) => e.id === id);
            if (found) dialog.open(found);
        } else {
            dialog.close();
        }
    });

    try {
        allEvents = normalizeData(data);
        loadingState.hidden = true;

        buildTypeChips();
        rerender();

        const initialId = eventIdFromHash();
        if (initialId) {
            const found = allEvents.find((e) => e.id === initialId);
            if (found) dialog.open(found);
        }
    } catch (err) {
        console.error(err);
        loadingState.textContent =
            "Couldn't load the timeline data. Check the console for details.";
    }
}

main();
