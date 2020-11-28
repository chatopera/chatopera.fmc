/**
 * Guess the secret number in the magician's hat. 
 * If your guess is too high or too low, you'll get a hint.
 * https://www.funbrain.com/games/guess-the-number
 */
 
+ __kickoff_guess_num
- {@__start_guess_num} ^regenSecretNumber(1,100)

    + (*)
    % {@__start_guess_num} ^regenSecretNumber(1,100)
    - ^verifyInputAgainstSecret(<cap1>)

+ 猜数字玩法
- 我在帽子里放一个 1～100 内的随机数字，
^ 你来猜这个数字是什么，这个数字和随机数字比较， 
^ 我会告诉您是大或者小，每轮有 5 次机会。 看看您在第几轮可以猜中，发送“猜数字”开始玩。


// group replies
+ __start_guess_num
- {keep} 我选了一个数字，放进帽子了，您来猜猜，
^ 范围是1到100。 这个数字是什么呢？
- 我已经将随机数放进帽子了，
^ 范围是1到100。 您猜猜吧？
- 我在帽子里放了一个随机数，
^ 范围是1到100。 猜猜看它是什么？