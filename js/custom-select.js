// Credit to: W3schools

function createSelectOption(selElmnt, optionsindex){
    /* create a new DIV that will act as an option item: */
    option = document.createElement("DIV");
    option.innerHTML = selElmnt.options[optionsindex].innerHTML;
    option.addEventListener("click", function (e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        selectelement = this.parentNode.parentNode.getElementsByTagName("select")[0];
        selectedbox = this.parentNode.previousSibling;
        for (option of selectelement.options){
            if(option.innerHTML == this.innerHTML){
                selectelement.selectedIndex = option.index;
                selectelement.dispatchEvent(new Event('change'));
                selectedbox.innerHTML = this.innerHTML;
                for(element of this.parentNode.getElementsByClassName("same-as-selected")){
                    element.removeAttribute("class");
                }
                this.setAttribute("class", "same-as-selected");
                break;
            }
        }
        selectedbox.click(); // Hide Select Dropdown after selecting item
    });
    return option;
}

function createSelect(){
    /* Look for any elements with the class "custom-select": */
    for ( customselect of document.getElementsByClassName("custom-select") ){
        selElmnt = customselect.getElementsByTagName("select")[0];
        /* For each element, create selectedDiv new DIV that will act as the selected item: */
        selectedDiv = document.createElement("DIV");
        selectedDiv.setAttribute("class", "select-selected");
        selectedDiv.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        customselect.appendChild(selectedDiv);
        /* For each element, create selectedDiv new DIV that will contain the option list: */
        selectitemsdiv = document.createElement("DIV");
        selectitemsdiv.setAttribute("class", "select-items select-hide");
        for( selectitem of selElmnt.getElementsByTagName("option")){
            selectitemsdiv.appendChild(createSelectOption(selElmnt, selectitem.index));
        }
        customselect.appendChild(selectitemsdiv);
        selectedDiv.addEventListener("click", function (e) {
            /* When the select box is clicked, close any other select boxes,
            and open/close the current select box: */
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
            if(this.classList.contains("select-arrow-active")){
                this.style.borderBottomLeftRadius = 0;
                this.style.borderBottomRightRadius = 0;
            }
        });
    }

    /* If the user clicks anywhere outside the select box,
    then close all select boxes: */
    document.addEventListener("click", closeAllSelect);

    for (const selectitem of document.getElementsByClassName("select-items select-hide")){
        selectitem.firstChild.click();
    }
}


function closeAllSelect(elmnt) {
    /* A function that will close all select boxes in the document,
    except the current select box: */
    for(const item of document.getElementsByClassName("select-selected")){
        item.style.removeProperty("border-bottom-left-radius");
        item.style.removeProperty("border-bottom-right-radius");
        if(!(elmnt == item)){
            item.classList.remove("select-arrow-active");
            item.style.borderBottomRightRadius = "";
            item.parentElement.getElementsByClassName("select-items")[0].classList.add("select-hide");
        }
    }
}

