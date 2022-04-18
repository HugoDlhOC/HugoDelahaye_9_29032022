/**
 * @jest-environment jsdom
 */

import {getByTestId, screen, waitFor} from "@testing-library/dom";
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
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };


      const objNewBill = new NewBill({document, onNavigate: onNavigate, store: storeMock, localStorage: window.localStorage})

      const fakeHandleSubmit = jest.fn((e) => objNewBill.handleSubmit(e))
      const buttonSubmit = screen.getByTestId('sumbit-btn');

      buttonSubmit.addEventListener('click', (e) =>  {
        fakeHandleSubmit(e);
      });
      userEvent.click(buttonSubmit);
      expect(fakeHandleSubmit).toHaveBeenCalled();
    })
  })
})
