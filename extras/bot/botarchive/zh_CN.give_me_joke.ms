+ (*) 笑话 (*)
- {CLEAR} ^nextJoke()

+ __next_joke
- {CLEAR} ^nextJoke()

+ (不好笑|不逗) (*)
- {@__reply_not_funny}


/**
 * Group replies
 */
 
+ __reply_not_funny
- 笑点高，不容易笑
^ ^attachQuickReplies()
- 小笑话不容易做包袱
^ ^attachQuickReplies()

+ __reply_no_more_joke_now
- 编不出来了，等我想想明天再给你讲
^ ^attachQuickReplies()
- 我先去吃饭了，明天再聊
^ ^attachQuickReplies()