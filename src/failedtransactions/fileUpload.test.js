import { render, screen, fireEvent } from "@testing-library/react";
import FileUpload from "./fileUpload";

describe("File Upload component", () => {
  it("should render File upload component correctly", () => {
    render(<FileUpload />);
    const element = screen.getByText("Select a file: (either excel/xml format)");
    expect(element).toBeInTheDocument();
  });


  it("click on validate report button, it should be present in the document", () => {
    const { getByTestId } = render(<FileUpload />);
    const fileInput = getByTestId('fileReport');
    const file = new File(['test file content'], 'test.csv', {
                    type: 'text/csv',
    });
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    fireEvent.change(fileInput, { target: { files: [file] } }); 
    expect(fileInput).toBeInTheDocument();
  })

  it("fileinput and validate button should be there in the document", () => {
        const { getByTestId } = render(<FileUpload />);
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        const fileInput = getByTestId('fileReport');
        const file = new File(['test file content'], 'test.csv', {
            type: 'text/csv',
        });
        fireEvent.change(fileInput, { target: { files: [file] } });
        const validateReportButton = getByTestId('validateReport');
        fireEvent.click(validateReportButton);
        expect(validateReportButton).toBeInTheDocument();
        expect(fileInput).toBeInTheDocument();
        expect(window.alert).toBeCalled()
  })
});