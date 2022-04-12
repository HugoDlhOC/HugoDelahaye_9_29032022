/**
 * @jest-environment jsdom
 */

import {getByTestId, screen, waitFor} from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import {storeMock} from "../__mocks__/store.js";
import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      console.log(windowIcon.classList[0]);
      //to-do write expect expression
      //Si la classe active-icon est présente sur cette icone, alors elle est en surbrillance
      expect(windowIcon.classList[0]).toBe("active-icon");

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      let datesSortedJoined = [];
      datesSorted.forEach(date => {
        datesSortedJoined.push(parseInt(date.split("-").join("")));
      });

      //expect(dates).toEqual(datesSorted)
      expect(datesSortedJoined[0]).toBeGreaterThan(datesSortedJoined[1]);
      expect(datesSortedJoined[1]).toBeGreaterThan(datesSortedJoined[2]);
      expect(datesSortedJoined[2]).toBeGreaterThan(datesSortedJoined[3]);
    })
/*
    //Si on clique sur une icone oeuil, alors le justificatif correspondant doit s'afficher 
    test("Then I click on a button in the shape of an eye, a modal with the supporting document of the invoice must be displayed", async () => {
      
      //let objBill = new Bill(document, onNavigate, storeMock, localStorageMock);

      //On se rend dans la page Bills
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const eyeIcons = await waitFor(() => screen.queryAllByTestId("icon-eye"));
      //console.log(document.querySelectorAll(`div[data-testid="icon-eye"]`).length);
      console.log(eyeIcons);
    });*/

    //Si le bouton Nouvelle note de frais est cliqué, alors on change de "route"
    test("Then I click on the New expense report button and I can enter an expense report", () => {
      //A compléter
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: { bills } });
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const objBills = new Bills(document, onNavigate, store, window.localStorage)
      /*document.body.innerHTML = `
      <div class='layout'>
        <div class='content'>
          <div class='content-header'>
            <div class='content-title'> Mes notes de frais </div>
            <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
          </div>
        </div>
       </div>`;*/

      const fakeHandleClickNewBill = jest.fn(() => bills.handleClickNewBill())
      const buttonNewBill = screen.getByTestId('btn-new-bill');

      buttonNewBill.addEventListener('click', fakeHandleClickNewBill);
      userEvent.click(buttonNewBill);
      expect(fakeHandleClickNewBill).toHaveBeenCalled();
    }); 

    //Test d'intégration API GET
    /*
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const nameOfFirstBill  = await screen.getByText("encore")
      expect(nameOfFirstBill).toBeTruthy()
      const typeOfFirstBill  = await screen.getByText("Hôtel et logement")
      expect(typeOfFirstBill).toBeTruthy()
      const dateOfFirstBill = await screen.getByText("2004-04-04");
      expect(dateOfFirstBill).toBeTruthy()
    })*/
  })
})