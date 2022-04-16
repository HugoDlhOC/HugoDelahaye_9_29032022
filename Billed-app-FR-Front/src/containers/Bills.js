import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url") //L'URL du fichier de justificatif
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5) //Grandeur de l'image
    console.log(this.document.querySelector(".modal-body"));

    //On vient ajouter le code HTML avec les valeurs de billUrl et imgWidth dans .modal-body
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          console.log('length', bills.length)
          console.log(bills);
          let datesRecup =[];
          const antiChrono = (a, b) => ((a < b) ? 1 : -1) //Si la date est -grande que l'autre alors vrai : 1 

          //Retrouver les index des factures correspondantes au dates
          bills.forEach((bill, index) => {
            console.log(bill.date);
            if(bill.date !== null){
              datesRecup.push(bill.date + "/" + index);
            }
          })
          console.log(datesRecup)
          console.log(this.store)
          const datesSorted = [...datesRecup].sort(antiChrono)
          console.log(datesSorted);

          //Stockage des index du bon ordre des factures
          let newIndexOfBills = [];
          datesSorted.forEach(dateSorted => {
            newIndexOfBills.push(parseInt(dateSorted.split("/")[1]));
          })
          console.log(newIndexOfBills);

          //Réorganisation des factures
          let newOrderOfBills = [];
          //newIndexOfBills.forEach
          newIndexOfBills.forEach(newIndexOfBill => {
            newOrderOfBills.push(bills[newIndexOfBill]);
          })
          console.log(newOrderOfBills);

        return newOrderOfBills
        //return bills
      })
    }
  }
}
