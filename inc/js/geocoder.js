/**
 * 
 * @param {Строка с адресом координаты которого ищем} address 
 * @param {Функция принимающая один параметр, будет получать координаты, когда пользователь или скрипт их получит} callbackFunc 
 */

async function getCoords(address = "", callbackFunc)
{
   if (address == "")
      return;

   var geocodeService = "http://search.maps.sputnik.ru/search/addr?q=";
   var httpObject = new XMLHttpRequest();
   var responseObject;

   httpObject.open("GET", geocodeService + address, true);
   httpObject.onload = async function (){
      responseObject = JSON.parse(httpObject.response);
      responseObject = responseObject.result.address[0].features;

      if (responseObject.length == 0)
      {
            callbackFunc("");
      }
      else if (responseObject.length == 1)
      {
            await parseSoloCoord(responseObject, callbackFunc);
      }
      else   
      {
            await parsePolyCoords(responseObject, callbackFunc);
      }
   }
   httpObject.send(null);
}

function parseSoloCoord(geoObject, callbackFunc)
{
   callbackFunc(geoObject[0].geometry.geometries[0].coordinates);
}

async function parsePolyCoords(geoObject, callbackFunc)
{  
   // Генерация модального окна
   var dynamicModal = document.createElement('div');
   dynamicModal.className = 'geocoder-modal';
   dynamicModal.style.width = '40%';
   dynamicModal.style.backgroundColor = '#e3e9f1';
   dynamicModal.style.height = (50 + 50 * geoObject.length) + 'px';
   dynamicModal.style.position = 'absolute';
   dynamicModal.style.margin = '200px 30%';
   dynamicModal.style.borderRadius = '10px';
   document.body.appendChild(dynamicModal);

   var dynamicModalTitle = document.createElement('h3');
   dynamicModalTitle.className = 'geocoder-modal-title';
   dynamicModalTitle.style.width = '100%';
   dynamicModalTitle.style.textAlign = 'center';
   dynamicModalTitle.innerHTML = 'Выберите адрес из представленного списка:';
   dynamicModalTitle.style.font = 'normal 16px Tahoma';
   dynamicModal.appendChild(dynamicModalTitle);

   var dynamicModalButtonContainer = document.createElement('div');
   dynamicModalButtonContainer.className = 'geocoder-modal-radio-buttons';
   dynamicModalButtonContainer.style.width = '100%';
   dynamicModalButtonContainer.style.height = '100%';
   dynamicModalButtonContainer.style.margin = '0 10px';
   dynamicModal.appendChild(dynamicModalButtonContainer);

   for (var i = 0; i < geoObject.length; i++)
   {
      var dynamicModalPContainer = document.createElement('p');
      dynamicModalButtonContainer.appendChild(dynamicModalPContainer);

      var dynamicModalRadioButton = document.createElement('input');
      dynamicModalRadioButton.className = 'geocoder-modal-radio-button';
      dynamicModalRadioButton.id = 'geocoderRadio' + i;
      dynamicModalRadioButton.type = 'radio';
      dynamicModalPContainer.appendChild(dynamicModalRadioButton);

      var dynamicModalRadioButtonLabel = document.createElement('label');
      dynamicModalRadioButtonLabel.className = 'geocoder-modal-radio-button-label';
      dynamicModalRadioButtonLabel.htmlFor = 'geocoderRadio' + i;
      dynamicModalRadioButtonLabel.innerHTML = geoObject[i].properties.display_name;
      dynamicModalRadioButtonLabel.style.font = 'normal 16px Tahoma';
      dynamicModalRadioButtonLabel.style.marginLeft = '15px';
      dynamicModalPContainer.appendChild(dynamicModalRadioButtonLabel);

      // Вешаем обработку
      dynamicModalRadioButton.addEventListener('click', async function() {
            var tempIDWritter = this.id.replace('geocoderRadio', '');
            document.body.removeChild(dynamicModal);
            callbackFunc(geoObject[tempIDWritter].geometry.geometries[0].coordinates);
      });
   }
}