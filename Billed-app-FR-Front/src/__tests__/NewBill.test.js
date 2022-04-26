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
import storeMock from "../__mocks__/store.js";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

beforeEach(() => {
  document.body.innerHTML = "";
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //console.log(document.body.innerHTML)
      //to-do write assertion
    })
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
      console.log(storeMock)
      const objNewBill = new NewBill({document, onNavigate: onNavigate, store: storeMock, localStorage: window.localStorage})

      const fakeHandleChangeFile = jest.fn((e) => objNewBill.handleChangeFile(e))
      const buttonChangeFile = screen.getByTestId('file');

      buttonChangeFile.addEventListener('click', (e) =>  {
        fakeHandleChangeFile(e);
      });
      userEvent.click(buttonChangeFile);
      expect(fakeHandleChangeFile).toHaveBeenCalled();
    })

    test("Then i click in the <submit> button.", () => {

      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      console.log(document.body.innerHTML)
      console.log(document.querySelector(`select[data-testid="expense-type"]`).value)
      console.log(screen.getByTestId("expense-name"))
      const objNewBill = new NewBill({document, onNavigate: onNavigate, store: storeMock, localStorage: window.localStorage})

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
      //userEvent.selectOptions(screen.getByTestId("expense-type"), ["Transports"]);
      
      userEvent.click(buttonSubmit);
      expect(fakeHandleSubmit).toHaveBeenCalled();
    })
  })
  describe("When I am on bills page", () => {

    //Erreur 500 : indique une erreur interne du serveur dans le protocole de communication http.
    test("Then the invoice import failed with error 500.", () => {
      
      storeMock.bills().list(() => {
        Promise.reject(new Error("Erreur 500"));
      })
      document.body.innerHTML = BillsUI({error: "Erreur 500"});
      console.log(document.body.innerHTML)

      //Vérification que l'on ai bien le message d'erreur qui apparait
      const valueErrorMessage = document.querySelector('[data-testid="error-message"]').innerHTML
      console.log(valueErrorMessage);
      expect(valueErrorMessage).toInclude("Erreur 500");
    });

    //Erreur 404 : il est envoyé par un serveur HTTP et indique que ce dernier n'a pas réussi à trouver la ressource recherchée .
    test("Then the invoice import failed with error 404.", () => {
      
      storeMock.bills().list(() => {
        Promise.reject(new Error("Erreur 404"));
      })
      document.body.innerHTML = BillsUI({error: "Erreur 404"});
      console.log(document.body.innerHTML)

      //Vérification que l'on ai bien le message d'erreur qui apparait
      const valueErrorMessage = document.querySelector('[data-testid="error-message"]').innerHTML
      console.log(valueErrorMessage);
      expect(valueErrorMessage).toInclude("Erreur 404");
    });
  });
})


