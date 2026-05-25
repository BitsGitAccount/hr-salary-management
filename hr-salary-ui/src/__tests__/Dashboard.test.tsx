import { render, screen, waitFor } from "@testing-library/react";
import { InsightsDashboard } from "@/components/dashboard/InsightsDashboard";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("InsightsDashboard", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("renders salary metric cards with data from API", async () => {
    // Mock successful API response for country insights
    const mockInsightsData = {
      summary: {
        totalPayroll: 5250000,
        averageSalary: 52500,
        highestSalary: 150000,
        lowestSalary: 30000,
        employeeCount: 100,
      },
      byCountry: [
        { country: "United States", averageSalary: 75000, employeeCount: 40 },
        { country: "Germany", averageSalary: 65000, employeeCount: 25 },
        { country: "India", averageSalary: 35000, employeeCount: 20 },
        { country: "United Kingdom", averageSalary: 70000, employeeCount: 15 },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInsightsData,
    });

    render(<InsightsDashboard />);

    // Wait for data to load and verify metric cards are rendered
    await waitFor(() => {
      expect(screen.getByText("Total Payroll")).toBeInTheDocument();
    });

    // Verify all four metric cards are displayed
    expect(screen.getByText("Total Payroll")).toBeInTheDocument();
    expect(screen.getByText("Average Salary")).toBeInTheDocument();
    expect(screen.getByText("Highest Salary")).toBeInTheDocument();
    expect(screen.getByText("Lowest Salary")).toBeInTheDocument();

    // Verify metric values are displayed (formatted as currency)
    expect(screen.getByText("$5,250,000")).toBeInTheDocument();
    expect(screen.getByText("$52,500")).toBeInTheDocument();
    expect(screen.getByText("$150,000")).toBeInTheDocument();
    expect(screen.getByText("$30,000")).toBeInTheDocument();
  });

  it("renders loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<InsightsDashboard />);

    expect(screen.getByText("Loading insights...")).toBeInTheDocument();
  });

  it("renders error state when API fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<InsightsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load insights")).toBeInTheDocument();
    });
  });

  it("calls the correct API endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        summary: {
          totalPayroll: 0,
          averageSalary: 0,
          highestSalary: 0,
          lowestSalary: 0,
          employeeCount: 0,
        },
        byCountry: [],
      }),
    });

    render(<InsightsDashboard />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/insights/country")
      );
    });
  });
});
