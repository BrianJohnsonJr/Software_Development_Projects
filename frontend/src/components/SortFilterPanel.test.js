import { render, screen, fireEvent } from "@testing-library/react";
import SortFilterPanel from "./SortFilterPanel";

describe("SortFilterPanel Component", () => {
  const mockOnSortChange = jest.fn();
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnSortChange.mockClear();
    mockOnFilterChange.mockClear();
  });

  test("renders sort and filter panel components", () => {
    render(
      <SortFilterPanel
        onSortChange={mockOnSortChange}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Check if the toggle button is present
    expect(screen.getByText("☰")).toBeInTheDocument();

    // Check if sort options are rendered
    const sortOptions = ["Title A-Z", "Title Z-A", "Price Low-High", "Price High-Low"];
    sortOptions.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });

    // Check if tags, price inputs, and item types are rendered
    expect(screen.getByPlaceholderText("Add Tag")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Min")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Max")).toBeInTheDocument();
    expect(screen.getByText("Tshirt")).toBeInTheDocument();
    expect(screen.getByText("Hoodie")).toBeInTheDocument();
  });

  test("toggles panel visibility when the button is clicked", () => {
    render(
      <SortFilterPanel
        onSortChange={mockOnSortChange}
        onFilterChange={mockOnFilterChange}
      />
    );

    const toggleButton = screen.getByText("☰");
    const panel = screen.getByText("Sort & Filter").parentElement;

    // Panel should be hidden initially
    expect(panel).not.toHaveClass("open");

    // Click toggle button to open panel
    fireEvent.click(toggleButton);
    expect(panel).toHaveClass("open");

    // Click toggle button again to close panel
    fireEvent.click(toggleButton);
    expect(panel).not.toHaveClass("open");
  });

  test("calls onSortChange when a sort option is selected", () => {
    render(
      <SortFilterPanel
        onSortChange={mockOnSortChange}
        onFilterChange={mockOnFilterChange}
      />
    );

    const sortOption = screen.getByText("Title A-Z");
    fireEvent.click(sortOption);

    expect(mockOnSortChange).toHaveBeenCalledWith("title-asc");
  });

  test("adds and removes tags correctly", () => {
    const mockOnFilterChange = jest.fn();
    render(<SortFilterPanel onSortChange={jest.fn()} onFilterChange={mockOnFilterChange} />);
  
    const tagInput = screen.getByPlaceholderText("Add Tag");
  
    // Add a tag
    fireEvent.change(tagInput, { target: { value: "React" } });
    fireEvent.keyDown(tagInput, { key: "Enter", code: "Enter" });
  
    // Ensure the tag is displayed (case-insensitive check)
    expect(screen.getByText((content) => content.toLowerCase() === "react")).toBeInTheDocument();
  
    // Remove the tag
    fireEvent.click(screen.getByText((content) => content.toLowerCase() === "react"));
    expect(screen.queryByText((content) => content.toLowerCase() === "react")).not.toBeInTheDocument();
  });

  test("updates min and max price correctly", () => {
    render(
      <SortFilterPanel
        onSortChange={mockOnSortChange}
        onFilterChange={mockOnFilterChange}
      />
    );

    const minPriceInput = screen.getByPlaceholderText("Min");
    const maxPriceInput = screen.getByPlaceholderText("Max");

    fireEvent.change(minPriceInput, { target: { value: "10" } });
    fireEvent.change(maxPriceInput, { target: { value: "100" } });

    expect(minPriceInput.value).toBe("10");
    expect(maxPriceInput.value).toBe("100");

    expect(mockOnFilterChange).toHaveBeenCalledWith({ minPrice: 10, maxPrice: 100 });
  });

  test("toggles item type selection", () => {
    render(
      <SortFilterPanel
        onSortChange={mockOnSortChange}
        onFilterChange={mockOnFilterChange}
      />
    );

    const tshirtType = screen.getByText("Tshirt");

    // Select Tshirt
    fireEvent.click(tshirtType);
    expect(tshirtType).toHaveClass("selected");
    expect(mockOnFilterChange).toHaveBeenCalledWith({ types: ["Tshirt"] });

    // Deselect Tshirt
    fireEvent.click(tshirtType);
    expect(tshirtType).not.toHaveClass("selected");
    expect(mockOnFilterChange).toHaveBeenCalledWith({ types: [] });
  });

  test("toggles between 'All' and 'Any' for tags apply", () => {
    render(
      <SortFilterPanel
        onSortChange={mockOnSortChange}
        onFilterChange={mockOnFilterChange}
      />
    );

    const toggleSwitch = screen.getByRole("checkbox");
    const toggleLabel = screen.getByText("All");

    // Switch to 'Any'
    fireEvent.click(toggleSwitch);
    expect(toggleLabel).toHaveTextContent("Any");
    expect(mockOnFilterChange).toHaveBeenCalledWith({ tagsApply: "any", tags: [] });

    // Switch back to 'All'
    fireEvent.click(toggleSwitch);
    expect(toggleLabel).toHaveTextContent("All");
    expect(mockOnFilterChange).toHaveBeenCalledWith({ tagsApply: "all", tags: [] });
  });
});
