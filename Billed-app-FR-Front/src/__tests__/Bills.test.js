/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from "@testing-library/dom";
import mockStore from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { formatDate } from "../app/format.js";
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
      //Ajout des dates dans la page Bills
      document.body.innerHTML = BillsUI({ data: bills });

      //On récupère les dates contenues dans la page, on stocke la date en HTML pour la comparer ensuite
      const datesPage = screen.getAllByTestId("value-element-table_bills-date");
      const datesPageInnerHTML = [];
      datesPage.forEach((datePage) => {
        datesPageInnerHTML.push(datePage.innerHTML);
      });

      //On récupère les dates des factures bills
      const billsDates = [];
      bills.forEach((bill) => {
        billsDates.push(formatDate(bill.date));
      });

      expect(datesPageInnerHTML).toEqual(billsDates);
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

    describe("When I click on the eye icon", () => {
      test("Then a modal with the correct proof is displayed.", async () => {
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

        const buttonNewBill = screen.getAllByTestId("icon-eye");
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
    });

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
  });

  describe("When I am on Bill page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });
});

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
    //Test d'intégration API GET
    test("Then we retrieve the invoices from the simulated API GET", async () => {
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
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      //On mocke la fonction bills présente dans NewBill, utilisée dans le fichier __mocks__/store.js
      jest.spyOn(mockStore, "bills");
    });

    //Erreur 404 : il est envoyé par un serveur HTTP et indique que ce dernier n'a pas réussi à trouver la ressource recherchée .
    test("Then fetches messages from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("Then fetches messages from an API and fails with 500 message error", async () => {
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
  });
});
