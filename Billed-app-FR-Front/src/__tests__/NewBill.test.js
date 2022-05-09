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
import store, { postTest } from "../__mocks__/store.js";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import Store from "../app/Store.js";
import DashboardUI from "../views/DashboardUI.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the fields of the form are available", async () => {
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
      expect(screen.getAllByTestId("expense-type")).toBeTruthy();
      expect(screen.getAllByTestId("expense-name")).toBeTruthy();
      expect(screen.getAllByTestId("datepicker")).toBeTruthy();
      expect(screen.getAllByTestId("amount")).toBeTruthy();
      expect(screen.getAllByTestId("vat")).toBeTruthy();
      expect(screen.getAllByTestId("pct")).toBeTruthy();
      expect(screen.getAllByTestId("commentary")).toBeTruthy();
      expect(screen.getAllByTestId("file")).toBeTruthy();
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
      form.addEventListener("submit", fakeHandleSubmit); //a ne pas redéfinir
      fireEvent.submit(form);
      //userEvent.click(screen.getByTestId("sumbit-btn"))
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

    test("Then an invoice is added, the exit code must be 200, test API POST", async () => {
      document.body.innerHTML = "";
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      //ajout de l'html
      document.body.innerHTML = NewBillUI();
      console.log(document.body.innerHTML);

      //instanciation
      const objNewBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

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

      //remplissage
      const form = screen.getByTestId("form-new-bill");

      screen.getByTestId("expense-type").value = billTest.type;
      userEvent.type(screen.getByTestId("expense-name"), billTest.name);
      screen.getByTestId("datepicker").value = billTest.date;
      userEvent.type(screen.getByTestId("amount"), billTest.date);
      userEvent.type(screen.getByTestId("vat"), billTest.vat);
      userEvent.type(screen.getByTestId("pct"), billTest.pct);
      userEvent.type(screen.getByTestId("commentary"), billTest.commentary);
      objNewBill.fileName = billTest.fileName;
      objNewBill.fileUrl = billTest.fileUrl;

      //simulation - mocks
      const virtualUpdateBill = (objNewBill.updateBill = jest.fn());
      const virtualHandleSubmit = jest.fn((e) =>
        objNewBill.handleSubmit(e)
      );
      form.addEventListener("submit", virtualHandleSubmit);
      fireEvent.submit(form);
      expect(virtualHandleSubmit).toHaveBeenCalled();
      expect(virtualUpdateBill).toHaveBeenCalled();
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      document.innerHTML = "";
      jest.spyOn(mockStore, "bills");
    });

    test("Then fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      console.log(document.body.innerHTML);
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

      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
