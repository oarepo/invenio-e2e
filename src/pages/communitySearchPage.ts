import { Locators } from "../locators";
import { BasePage } from "./basePage";

/**
 * Represents the Community Search page.
 * Provides methods to interact with sorting and verify selected options.
 */

export class CommunitySearchPage<T extends Locators = Locators> extends BasePage<T> {
  // NAVIGATION -------------------------------------------------------------------------

  /**
   * Selects an option from the 'Sort by' dropdown menu.
   * @param option The option to select ('Newest', 'Oldest', 'Best match').
   */
  async selectSortOption(option: string): Promise<void> {
    const dropdown = this.page.locator(this.locators.communitySearchPage.sortDropdown);
    await dropdown.click();

    const optionLocator = this.page.locator(this.locators.communitySearchPage.sortOption(option));
    await optionLocator.waitFor({ state: "visible" });
    await optionLocator.click();
  }

  // VERIFICATION ------------------------------------------------------------------------

  /**
   * Verifies whether the given sort option is selected.
   * @param option The name of the option to verify.
   * @returns True if the option is selected, otherwise false.
   */
  async isSortOptionSelected(option: string): Promise<boolean> {
    const selectedTextLocator = this.page
      .locator(this.locators.communitySearchPage.sortOptionSelected)
      .first();
    const text = await selectedTextLocator.textContent();
    return text?.trim() === option;
  }
}
