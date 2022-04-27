/**
 * @jest-environment jsdom
 */
import { fireEvent, getByTestId, screen, waitFor } from "@testing-library/dom";
import mockStore from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import storeByFile from "../app/Store.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);
$.fn.modal = jest.fn(); //spectre global : ajout de la fct modal de Jquery pour le bon fonctionnement de handleClickIconEye(eye)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      //Si la classe active-icon est présente sur cette icone, alors elle est en surbrillance
      expect(windowIcon.classList[0]).toBe("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = ["2004-04-04", "2003-03-03", "2002-02-02", "2001-01-01"];
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      console.log(dates);
      const datesSorted = [...dates].sort(antiChrono);
      console.log(datesSorted);
      expect(dates).toEqual(datesSorted);
    });

    test("Then the array elements are displayed with values", async () => {
      document.body.innerHTML = BillsUI({ data: bills });
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("table_bills"));

      expect(screen.getByTestId("element-table_bills-type").innerHTML).toBe(
        "Type"
      );
      expect(screen.getByTestId("element-table_bills-name").innerHTML).toBe(
        "Nom"
      );
      expect(screen.getByTestId("element-table_bills-date").innerHTML).toBe(
        "Date"
      );
      expect(screen.getByTestId("element-table_bills-amount").innerHTML).toBe(
        "Montant"
      );
      expect(screen.getByTestId("element-table_bills-status").innerHTML).toBe(
        "Statut"
      );
      expect(screen.getByTestId("element-table_bills-actions").innerHTML).toBe(
        "Actions"
      );
      expect(
        screen.getAllByTestId("value-element-table_bills-type")[0].innerHTML
      ).toBe("Hôtel et logement");
      expect(
        screen.getAllByTestId("value-element-table_bills-name")[0].innerHTML
      ).toBe("encore");
      expect(
        screen.getAllByTestId("value-element-table_bills-date")[0].innerHTML
      ).toBe("4 Avr. 04");
      expect(
        screen.getAllByTestId("value-element-table_bills-amount")[0].innerHTML
      ).toBe("400 €");
      expect(
        screen.getAllByTestId("value-element-table_bills-status")[0].innerHTML
      ).toBe("pending");
      expect(screen.getByTestId("tbody").childElementCount).toEqual(4);
    });

    //Si on clique sur une icone oeil, alors le justificatif correspondant doit s'afficher
    test("Then I click on a button in the shape of an eye, a modal with the supporting document of the invoice must be displayed", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      document.body.innerHTML = BillsUI({ data: [...bills] });
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const objBills = new Bills({
        document,
        onNavigate: onNavigate,
        store,
        localStorage: window.localStorage,
      });

      console.log(document.body.innerHTML);
      const buttonNewBill = screen.getAllByTestId("icon-eye");
      console.log(buttonNewBill[0].innerHTML);
      const fakeHandleClickIconEye = jest.fn(() =>
        objBills.handleClickIconEye(buttonNewBill[0])
      );

      buttonNewBill[0].addEventListener("click", fakeHandleClickIconEye);
      userEvent.click(buttonNewBill[0]);
      expect(fakeHandleClickIconEye).toHaveBeenCalled();
      expect(screen.getByText("Justificatif").innerHTML).toBe("Justificatif");
      expect(screen.getByAltText("Bill").src).toBe(
        "https://test.storage.tld/v0/b/billable-677b6.a%E2%80%A6f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"
      );
    });

    //Si le bouton Nouvelle note de frais est cliqué, alors on change de "route"
    test("Then I click on the New expense report button, handleClickNewBill() is called", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = BillsUI({ data: { bills } });
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const objBills = new Bills({
        document,
        onNavigate: onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const fakeHandleClickNewBill = jest.fn(() =>
        objBills.handleClickNewBill()
      );
      const buttonNewBill = screen.getByTestId("btn-new-bill");

      buttonNewBill.addEventListener("click", fakeHandleClickNewBill);
      userEvent.click(buttonNewBill);
      expect(fakeHandleClickNewBill).toHaveBeenCalled();
    });

    //Test d'intégration API GET
    test("fetches bills from mock API GET", async () => {
      document.body.innerHTML = "";
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText("Mes notes de frais"));
      const nameOfFirstBill = await screen.getByText("encore");
      expect(nameOfFirstBill).toBeTruthy();
      const typeOfFirstBill = await screen.getByText("Hôtel et logement");
      expect(typeOfFirstBill).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });

    //Erreur 404 : il est envoyé par un serveur HTTP et indique que ce dernier n'a pas réussi à trouver la ressource recherchée .
    test("Then the invoice import failed with error 404.", () => {
      mockStore.bills().list(() => {
        Promise.reject(new Error("Erreur 404"));
      });
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      console.log(document.body.innerHTML);

      //Vérification que l'on ai bien le message d'erreur qui apparait
      const valueErrorMessage = document.querySelector(
        '[data-testid="error-message"]'
      ).innerHTML;
      console.log(valueErrorMessage);
      expect(valueErrorMessage).toInclude("Erreur 404");
    });
  });
  describe("When I am on Bills Page but in loading state", () => {
    test("Then a loading message is display.", () => {
      document.body.innerHTML = BillsUI({ loading: true });

      console.log(document.body.innerHTML);
      console.log(screen.getByText("Loading...").innerHTML);
      expect(screen.getByText("Loading...")).toBeTruthy();
    });
  });
});
