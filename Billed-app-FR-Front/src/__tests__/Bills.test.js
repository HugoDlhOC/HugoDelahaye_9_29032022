/**
 * @jest-environment jsdom
 */
 import mockStore from "../__mocks__/store.js";
 import {getByTestId, screen, waitFor} from "@testing-library/dom";
 import userEvent from '@testing-library/user-event'
 import Bills from "../containers/Bills.js";
 import BillsUI from "../views/BillsUI.js";
 import storeByFile from "../app/Store.js"
 import { bills } from "../fixtures/bills.js";
 import { ROUTES, ROUTES_PATH } from "../constants/routes";
 import {localStorageMock} from "../__mocks__/localStorage.js";
 
 import router from "../app/Router.js";
 
 jest.mock("../app/store", () => mockStore);

 
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

       //to-do write expect expression
       //Si la classe active-icon est présente sur cette icone, alors elle est en surbrillance
       expect(windowIcon.classList[0]).toBe("active-icon");
 
     })
     test("Then bills should be ordered from earliest to latest", () => {
       document.body.innerHTML = BillsUI({ data: bills })
       const olddates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
       const dates = [
           "04-04-2004",
           "03-03-2003",
           "02-02-2002",
           "01-01-2001"]
       const antiChrono = (a, b) => ((a < b) ? 1 : -1)
       const datesSorted = [...dates].sort(antiChrono)


       /*let datesSortedJoined = [];
       datesSorted.forEach(date => {
         datesSortedJoined.push(parseInt(date.split("-").join("")));
       });*/

       expect(dates).toEqual(datesSorted)
       //expect(datesSortedJoined[0]).toBeGreaterThan(datesSortedJoined[1]);
       //expect(datesSortedJoined[1]).toBeGreaterThan(datesSortedJoined[2]);
       //expect(datesSortedJoined[2]).toBeGreaterThan(datesSortedJoined[3]);
     })
 
     test("V2-Then bills should be ordered from earliest to latest", () => {
       const dates = ["22/10/21", "22/10/21", "22/10/21", "16/03/22", "07/04/22", "16/03/22", "16/03/22", "01/12/70"];
       const antiChrono = (a, b) => ((a < b) ? 1 : -1)
       const datesSorted = dates.sort(antiChrono)
       let datesSortedJoined = [];
       datesSorted.forEach(date => {
         datesSortedJoined.push(parseInt(date.split("-").join("")));
       });
   
     })
 
     test("Then the array elements are displayed", async () => {
 
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
       }))
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.Bills)
       await waitFor(() => screen.getByTestId('table_bills'))
       const elementTableType = screen.getByTestId('element-table_bills-type');
       const elementTableName = screen.getByTestId('element-table_bills-name');
       const elementTableDate = screen.getByTestId('element-table_bills-date');
       const elementTableAmount = screen.getByTestId('element-table_bills-amount');
       const elementTableStatus = screen.getByTestId('element-table_bills-status');
       const elementTableActions = screen.getByTestId('element-table_bills-actions');

       expect(elementTableType.innerHTML).toBe("Type");
       expect(elementTableName.innerHTML).toBe("Nom");
       expect(elementTableDate.innerHTML).toBe("Date");
       expect(elementTableAmount.innerHTML).toBe("Montant");
       expect(elementTableStatus.innerHTML).toBe("Statut");
       expect(elementTableActions.innerHTML).toBe("Actions");
     });
 
 
     //Si on clique sur une icone oeil, alors le justificatif correspondant doit s'afficher 
     test("Then I click on a button in the shape of an eye, a modal with the supporting document of the invoice must be displayed", async () => {
       //En cours
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
       }))
       document.body.innerHTML = BillsUI({ data: { bills } });
       const store = null;
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname });
       };
       const objBills = new Bills({document, onNavigate: onNavigate, store, localStorage: window.localStorage})
       screen.getByTestId("tbody").innerHTML = `<tr>
       <td>Restaurants et bars</td>
       <td>Test91</td>
       <td>7 Avr. 22</td>
       <td>2 €</td>
       <td>En attente</td>
       <td>
         <div class="icon-actions">
       <div id="eye" data-testid="icon-eye" data-bill-url="http://localhost:5678/public/fa08b2a5ea3ce810abc8ff53a2873554">
       <svg xmlns="http://www.w3.org/2000/svg" width="0.244444in" height="0.166667in" viewBox="0 0 22 15">
 <path id="Imported Path" fill="#0D5AE5" stroke="none" stroke-width="0" d="M 11.00,0.00
       C 6.00,0.00 1.73,3.11 0.00,7.50
         1.73,11.89 6.00,15.00 11.00,15.00
         16.00,15.00 20.27,11.89 22.00,7.50
         20.27,3.11 16.00,0.00 11.00,0.00 Z
       M 11.00,12.50
       C 8.24,12.50 6.00,10.26 6.00,7.50
         6.00,4.74 8.24,2.50 11.00,2.50
         13.76,2.50 16.00,4.74 16.00,7.50
         16.00,10.26 13.76,12.50 11.00,12.50 Z
       M 11.00,4.50
       C 9.34,4.50 8.00,5.84 8.00,7.50
         8.00,9.16 9.34,10.50 11.00,10.50
         12.66,10.50 14.00,9.16 14.00,7.50
         14.00,5.84 12.66,4.50 11.00,4.50 Z"></path>
 </svg>
       </div>
     </div>
       </td>
     </tr>`
     console.log(document.body.innerHTML);
     const buttonNewBill = screen.getByTestId('icon-eye');
     const fakeHandleClickIconEye = jest.fn(() => objBills.handleClickIconEye(buttonNewBill))

     buttonNewBill.addEventListener('click', fakeHandleClickIconEye);
     userEvent.click(buttonNewBill);
     expect(fakeHandleClickIconEye).toHaveBeenCalled();
     });
 
     //Si le bouton Nouvelle note de frais est cliqué, alors on change de "route"
     test("Then I click on the New expense report button and I can enter an expense report", () => {
 
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
       }))
       document.body.innerHTML = BillsUI({ data: { bills } });
       const store = null;
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname });
       };
       const objBills = new Bills({document, onNavigate: onNavigate, store, localStorage: window.localStorage})
 
       const fakeHandleClickNewBill = jest.fn(() => objBills.handleClickNewBill())
       const buttonNewBill = screen.getByTestId('btn-new-bill');
 
       buttonNewBill.addEventListener('click', fakeHandleClickNewBill);
       userEvent.click(buttonNewBill);
       expect(fakeHandleClickNewBill).toHaveBeenCalled();
     }); 
 
     //Test d'intégration API GET
     test("fetches bills from mock API GET", async () => {
       document.body.innerHTML = ""
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
     })
   })
 })
 
 