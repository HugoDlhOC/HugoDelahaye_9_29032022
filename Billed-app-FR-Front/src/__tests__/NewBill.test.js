/**
 * @jest-environment jsdom
 */

import {
  fireEvent,
  getAllByTestId,
  getByLabelText,
  getByTestId,
  screen,
  waitFor,
} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import storeByFile from "../app/Store.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { postTest } from "../__mocks__/store.js";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import DashboardUI from "../views/DashboardUI.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    //Test d'intégration API GET
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByText("Envoyer une note de frais"));
      const typeOfSpent1 = await screen.getByText("Transports");
      expect(typeOfSpent1).toBeTruthy();
      const typeOfSpent2 = await screen.getByText("Restaurants et bars");
      expect(typeOfSpent2).toBeTruthy();
      const typeOfSpent3 = await screen.getByText("Services en ligne");
      expect(typeOfSpent3).toBeTruthy();
    });

    test("Then the submitted supporting file is not correct.", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const objNewBill = new NewBill({
        document,
        onNavigate: onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const buttonChangeFile = await screen.getByTestId("file");
      const fakeHandleChangeFile = jest.fn((e) =>
        objNewBill.handleChangeFile(e)
      );

      buttonChangeFile.addEventListener("click", (e) => {
        fakeHandleChangeFile(e);
      });

      fireEvent.change(buttonChangeFile, {
        target: {
          files: [new File(["file.doc"], "file.doc", { type: "file/doc" })],
        },
      });
      userEvent.click(buttonChangeFile);
      expect(buttonChangeFile.files[0].name).not.toBe("file.png");
      const sendButton = screen.getByTestId("sumbit-btn");
      expect(fakeHandleChangeFile).toHaveBeenCalled();
      expect(sendButton.attributes[4].value).toBe("true");
    });

    test("Then the submitted supporting file is correct.", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const objNewBill = new NewBill({
        document,
        onNavigate: onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const buttonChangeFile = await screen.getByTestId("file");
      const fakeHandleChangeFile = jest.fn((e) =>
        objNewBill.handleChangeFile(e)
      );
      //buttonChangeFile.value = 'C:\\fakepath\\Opera GX Installer.app.zip';
      fireEvent.change(buttonChangeFile, {
        target: {
          files: [new File(["file.png"], "file.png", { type: "file/png" })],
        },
      });

      buttonChangeFile.addEventListener("click", (e) => {
        fakeHandleChangeFile(e);
      });
      userEvent.click(buttonChangeFile);
      expect(buttonChangeFile.files[0].name).toBe("file.png");
      const sendButton = screen.getByTestId("sumbit-btn");
      expect(fakeHandleChangeFile).toHaveBeenCalled();
      expect(sendButton.attributes.length).toBe(4);
    });

    test("Then i click in the <submit> button, with good values.", () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const objNewBill = new NewBill({
        document,
        onNavigate: onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const form = screen.getByTestId("form-new-bill");

      //Type de dépense
      screen.getByTestId("expense-type").value = "Transports";

      //Nom de la dépense
      userEvent.type(screen.getByTestId("expense-name"), "Vol Paris-NW");

      //Date
      screen.getByTestId("datepicker").value = "2022-04-03";

      //Montant TTC
      userEvent.type(screen.getByTestId("amount"), "400");

      //TVA nombre
      userEvent.type(screen.getByTestId("vat"), "80");

      //TVA %
      userEvent.type(screen.getByTestId("pct"), "20");

      //Commentaire
      userEvent.type(screen.getByTestId("commentary"), "NA");

      //Justificatif
      objNewBill.fileName = "chicago-6921293_1280.jpg";
      objNewBill.fileUrl =
        "https://cdn.pixabay.com/photo/2022/01/07/07/13/chicago-6921293_1280.jpg";

      const fakeHandleSubmit = jest.fn(objNewBill.handleSubmit);
      form.addEventListener("submit", fakeHandleSubmit);
      fireEvent.submit(form);
      expect(fakeHandleSubmit).toHaveBeenCalled();
    });
    test("Then the mail icon should be highlighted", async () => {
      document.body.innerHTML = "";
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
      window.onNavigate(ROUTES_PATH.NewBill);
      console.log(document.body.innerHTML);
      console.log(screen.getByTestId("icon-mail"));
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");

      //Si la classe active-icon est présente sur cette icone, alors elle est en surbrillance
      expect(mailIcon.classList[0]).toBe("active-icon");
    });
  });
});

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBills Page", () => {
    //POST : on va envoyer des données, créer des données, et si tout s'est bien passé, alors le code retour sera 200
    test("Then an invoice is added, the exit code must be 200, test API POST", async () => {
      //spyOn : Crée une fonction simulée similaire à jest.fn mais qui surveille également les appels à objet[methodName]. Retourne une fonction simulée de Jest.
      document.innerHTML = "";
      const spyFctPost = jest.spyOn(mockStore, "bills");
      const billTest = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };
      await postTest(billTest);
      console.log(document.body.innerHTML);
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      document.innerHTML = "";
      jest.spyOn(mockStore, "postTest");
    });

    test("Then the invoice import failed with error 404", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.NewBill);
      await new Promise(process.nextTick);
      console.log(document.body.innerHTML);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("Then the invoice import failed with error 500", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.NewBill);
      await new Promise(process.nextTick);
      console.log(document.body.innerHTML);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
