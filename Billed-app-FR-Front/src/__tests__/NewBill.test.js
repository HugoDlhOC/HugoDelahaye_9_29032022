/**
 * @jest-environment jsdom
 */

import {fireEvent, getByTestId, screen, waitFor} from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import storeByFile from "../app/Store.js"
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

//jest.mock("../app/store", () => mockStore)



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    //Test d'intégration API GET
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      console.log(document.body.innerHTML)
      await waitFor(() => screen.getByText("Envoyer une note de frais"))
      const typeOfSpent1  = await screen.getByText("Transports")
      expect(typeOfSpent1).toBeTruthy()
      const typeOfSpent2  = await screen.getByText("Restaurants et bars")
      expect(typeOfSpent2).toBeTruthy()
      const typeOfSpent3 = await screen.getByText("Services en ligne");
      expect(typeOfSpent3).toBeTruthy()
    })

    test("Then i click in the <choose a file> button.", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const objNewBill = new NewBill({document, onNavigate: onNavigate, store: mockStore, localStorage: window.localStorage})

      const fakeHandleChangeFile = jest.fn((e) => objNewBill.handleChangeFile(e))
      const buttonChangeFile = screen.getByTestId('file');

      console.log(document.body.innerHTML)
      buttonChangeFile.addEventListener('click', (e) =>  {
        fakeHandleChangeFile(e);
      });
      userEvent.click(buttonChangeFile);
      expect(fakeHandleChangeFile).toHaveBeenCalled();
    })

    test("Then the submitted supporting file is not correct.", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const objNewBill = new NewBill({document, onNavigate: onNavigate, store: mockStore, localStorage: window.localStorage})
      const button = await screen.getByTestId("file");
      const fakeHandleChangeFile = jest.fn((e) => objNewBill.handleChangeFile(e))
      const buttonChangeFile = screen.getByTestId('file');

      console.log(document.body.innerHTML)
      buttonChangeFile.addEventListener('click', (e) =>  {
        fakeHandleChangeFile(e);
      });

      fireEvent.change(button, {
        target: {
          files: [new File(["file.doc"], "file.doc", { type: "file/doc" })],
        },
      });
      console.log(button.files[0].name)
      expect(button.files[0].name).not.toBe("file.pdf");
      const sendButton = screen.getByTestId("sumbit-btn");
      console.log(sendButton.attributes[4].value);
      expect(sendButton.attributes[4].value).toBe("true");
    
/*
    test("Then i click in the <submit> button, with good values.", () => {
      //NON FONCTIONNEL
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      console.log(document.body.innerHTML)
      console.log(document.querySelector(`select[data-testid="expense-type"]`).value)
      console.log(screen.getByTestId("expense-name"))
      const objNewBill = new NewBill({document, onNavigate: onNavigate, store: mockStore, localStorage: window.localStorage})

      const form = screen.getByTestId("form-new-bill");
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "encore";
      screen.getByTestId("datepicker").value = "2004-04-04";
      screen.getByTestId("amount").value = "400";
      screen.getByTestId("vat").value = "80";
      screen.getByTestId("pct").value = "20";
      screen.getByTestId("commentary").value = "séminaire billed";
      screen.getByTestId("file").value = "preview-facture-free-201801-pdf-1.jpg";
      objNewBill.fileUrl = "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a";
      objNewBill.fileName = "preview-facture-free-201801-pdf-1.jpg";

      
      const fakeHandleSubmit = jest.fn(() => objNewBill.handleSubmit())
      const buttonSubmit = screen.getByTestId('sumbit-btn');

      buttonSubmit.addEventListener('click', () =>  {
        fakeHandleSubmit();
      });
      
      userEvent.click(buttonSubmit);
      expect(fakeHandleSubmit).toHaveBeenCalled();
    })*/
  })
})

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("Then the invoice import failed with error 404", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("Then the invoice import failed with error 500", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      console.log(document.body.innerHTML)
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

