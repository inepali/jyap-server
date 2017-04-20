
angular.module('Jyap.services', [])
    .factory('Jyap', function () {


        // General Arary Method
        var removeItemFromArray = function (list, item) {
            for (var i = 0; i < list.length; i++) {
                if (list[i] == item) {
                    list.splice(i, 1);
                    break;
                }
            }
            return list;
        };


        var isValidCardPick = function (selectedCards) {

            var validPick = false;
            var c1, c2, c3, c4, c5;
            var nums;

            if (selectedCards !== undefined && selectedCards.length > 0) {

                if (selectedCards.length === 1) {
                    validPick = true;
                } else if (selectedCards.length === 2) {
                    c1 = selectedCards[0];
                    c2 = selectedCards[1];

                    if (c1.num == c2.num)
                        validPick = true;

                } else if (selectedCards.length === 3) {

                    c1 = selectedCards[0];
                    c2 = selectedCards[1];
                    c3 = selectedCards[2];

                    var isThreeCard = c1.num == c2.num && c2.num == c3.num;

                    if (isThreeCard) {
                        validPick = true;
                    } else if (c1.cardType == c2.cardType && c2.cardType == c3.cardType) {
                        nums = [c1.num, c2.num, c3.num]
                        nums.sort(function (a, b) { return a - b });

                        if (nums[2] == nums[1] + 1 && nums[1] == nums[0] + 1) {
                            validPick = true;
                        }
                    }
                } else if (selectedCards.length == 4) {
                    c1 = selectedCards[0];
                    c2 = selectedCards[1];
                    c3 = selectedCards[2];
                    c4 = selectedCards[3];

                    var isFourCard = c1.num == c2.num && c2.num == c3.num && c3.num == c4.num;

                    if (isFourCard)
                        validPick = true;
                    else if (c1.cardType == c2.cardType && c2.num == c3.cardType && c3.cardType == c4.cardType) {
                        nums = [c1.num, c2.num, c3.num, c4.num]
                        nums.sort(function (a, b) { return a - b });

                        if (nums[3] == nums[2] + 1 && nums[2] == nums[1] + 1 && nums[1] == nums[0] + 1) {
                            validPick = true;
                        }
                    }

                } else if (selectedCards.length == 5) {
                    c1 = selectedCards[0];
                    c2 = selectedCards[1];
                    c3 = selectedCards[2];
                    c4 = selectedCards[3];
                    c4 = selectedCards[4];

                    var isFiveCard = c1.num == c2.num && c2.num == c3.num && c3.num == c4.num && c4.num == c5.num;

                    if (isFiveCard)
                        validPick = true;
                    else if (c1.cardType == c2.cardType && c2.num == c3.cardType && c3.cardType == c4.cardType && c4.cardType == c5.cardType) {
                        nums = [c1.num, c2.num, c3.num, c4.num, c5.num]
                        nums.sort(function (a, b) { return a - b });

                        if (nums[4] == nums[3] + 1 && nums[3] == nums[2] + 1 && nums[2] == nums[1] + 1 && nums[1] == nums[0] + 1) {
                            validPick = true;
                        }
                    }
                }
            }
            return validPick;
        };

        return {
            isValidCardPick: isValidCardPick,
            removeItemFromArray: removeItemFromArray
        };
    })