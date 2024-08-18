import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "@/layout/Footer";
import "@testing-library/jest-dom";

describe("Footer Component", () => {
  test("renders footer text correctly", () => {
    render(<Footer />);

    const headingElement = screen.getByText(
      /Empowering Your Financial Future/i
    );
    expect(headingElement).toBeInTheDocument();

    const paragraphElement = screen.getByText(
      /At DApp, we believe in providing secure and innovative banking solutions to help you manage your finances with ease./i
    );
    expect(paragraphElement).toBeInTheDocument();

    const copyrightElement = screen.getByText(
      /© \d{4} DApp. All rights reserved./i
    );
    expect(copyrightElement).toBeInTheDocument();
  });

  test("renders footer links correctly", () => {
    render(<Footer />);

    const privacyLink = screen.getByText(/Privacy Policy/i);
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "#");

    const termsLink = screen.getByText(/Terms of Service/i);
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute("href", "#");

    const contactLink = screen.getByText(/Contact Us/i);
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute("href", "#");
  });
});
