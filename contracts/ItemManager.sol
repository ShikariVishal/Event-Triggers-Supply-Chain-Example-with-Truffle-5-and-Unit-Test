pragma solidity ^0.6.6;

import "./Item.sol";
import "./Ownable.sol";

contract ItemManager is Ownable {
    
    enum state {created, brought, delivered}
    
    struct StructItem {
        Item _item;
        ItemManager.state _itemState;
        string _name;
    }
    
    mapping(uint => StructItem) public items;
    uint itemIndex;
    
    event SupplyChainStep(uint _index, uint _step, address _address);
    
    function createItem(string memory _name, uint _price) public onlyOwner{
        Item item = new Item(this, _price, itemIndex);
        items[itemIndex]._item = item;
        items[itemIndex]._itemState = ItemManager.state.created;
        items[itemIndex]._name = _name;
        emit SupplyChainStep(itemIndex, uint(items[itemIndex]._itemState), address(item));
        itemIndex++;
    }
    
    function triggerPayment(uint _index) public payable{
        Item item = items[_index]._item;
        require(address(item) == msg.sender, "Only items are allowed to update themselves");
        require(item.priceInWei() <= msg.value, "We don't accept partial payments");
        require(items[_index]._itemState == ItemManager.state.created, "Item is further in the chain");
        items[_index]._itemState = ItemManager.state.brought;
        emit SupplyChainStep(_index, uint(items[_index]._itemState), address(item));   
    }
    
    function triggerDelivery(uint _index) public onlyOwner{
        require(items[_index]._itemState == ItemManager.state.brought, "Item is further in the chain");
        items[_index]._itemState = ItemManager.state.delivered;
        emit SupplyChainStep(_index, uint(items[_index]._itemState), address(items[_index]._item));   
    }
    
}














