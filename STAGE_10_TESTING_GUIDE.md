# STAGE 10: AI Features - Testing Guide

## Quick Test Checklist

### 🎯 Customer Features

#### 1. AI Deal Request Helper
**Location**: Any worker profile → "Send Request" button

**Steps**:
1. Open app as CUSTOMER
2. Navigate to any worker profile
3. Tap "Send Request" button
4. Look for "✨ Help me describe my problem" button (should be visible)
5. Tap the AI helper button
6. Modal should open with subtitle "Tell me what work you need done..."
7. Type: "My AC is not cooling properly"
8. Tap "Get AI Help"
9. Should show loading spinner
10. After ~2-3 seconds, should show clarifying questions
11. Answer the questions (can leave blank)
12. Tap "Continue"
13. Should show:
    - Problem Description (editable)
    - Suggested Category badge
    - Urgency badge (if mentioned)
    - "AI suggestion – please review" notice
14. Edit the description if needed
15. Tap "Use This"
16. Modal should close and description should populate the main form

**Expected Result**: ✅ AI generates clear description, suggests category

---

#### 2. AI Search Assist
**Location**: Search tab

**Steps**:
1. Open app as CUSTOMER
2. Go to Search tab
3. Type natural language query: "I need urgent plumber for leaking tap"
4. Wait 300ms (debounce)
5. Should see loading spinner in search bar
6. Results should appear with:
   - Category filter auto-selected: "Plumber"
   - Sort changed to "nearest" (for urgent)
   - Category chip "Plumber" highlighted
7. Try another query: "looking for electrician to fix wiring"
8. Should auto-select "Electrician" category

**Expected Result**: ✅ Natural language converted to structured search

**Test Variations**:
```
❌ "plumber" → Normal search (no AI)
✅ "need a plumber" → AI Search Assist triggers
✅ "looking for electrician" → AI triggers
✅ "urgent AC repair needed" → AI triggers + urgency detected
```

---

### 🔧 Worker Features

#### 3. AI Request Reply Suggestions
**Location**: Activity tab → New Requests

**Steps**:
1. Switch to WORKER mode (use role switcher)
2. Go to Activity tab
3. Ensure you have at least one NEW request
   - If none, switch to CUSTOMER mode and send a request
4. Switch back to WORKER mode
5. On the Activity tab, you should see NEW requests
6. Look for "✨ AI Reply Suggestions" button (collapsed state)
7. Tap to expand
8. Should show 3 suggestion cards:
   - ✓ Accept (green icon)
   - ⏱ Waitlist (orange icon)
   - ✗ Politely Decline (red icon)
9. Each card should have:
   - Icon badge
   - Title + subtitle
   - Generated reply text
   - "Use This" button
10. Tap "Use This" on Accept card
11. Should show confirmation dialog
12. Confirm
13. Request should be accepted

**Expected Result**: ✅ Contextual replies generated based on customer request

---

#### 4. AI Chat Reply Suggestions
**Location**: Messages tab → Any chat conversation

**Steps**:
1. Switch to WORKER mode
2. Go to Messages tab (or navigate to chat/[id])
3. Open any conversation
4. You should see customer's last message
5. Look for "✨ AI Suggestions" button above input
6. Tap the button
7. Should show loading: "Getting suggestions..."
8. After ~2-3 seconds, should show horizontal chips with 3 replies
9. Each reply should be different:
   - Professional/detailed
   - Brief/friendly
   - Question/clarifying
10. Tap any chip
11. Text should insert into input field
12. You can edit before sending
13. Tap send button to send

**Expected Result**: ✅ 3 contextual reply options appear

**Test Edge Cases**:
- Customer message is very short: "Ok" → Should still generate replies
- Customer message is a question → One reply should be an answer
- Tap close button (X) → Suggestions should hide

---

## 🔍 Visual Inspection Checklist

### All AI Features Should Have:
- ✨ Sparkles icon (`sparkles`)
- Loading indicators when processing
- "AI suggestion – please review" notice (where applicable)
- Edit capability (no auto-send)
- Error handling (if API fails, shows retry or fallback)

### Color Scheme:
- AI buttons: Light blue background (`COLORS.primary + '10'`)
- AI icons: Primary blue (`COLORS.primary`)
- Success: Green for Accept
- Warning: Orange for Waitlist
- Error: Red for Reject
- Info: Blue for notices

---

## 🐛 Common Issues & Solutions

### Issue: AI button doesn't appear
**Solution**: 
- Check if you're in correct mode (Customer vs Worker)
- Ensure component is imported correctly
- Check console for errors

### Issue: "Failed to get AI response"
**Solution**:
- Check internet connection
- Verify Gemini API key is valid in `app/config/gemini.ts`
- Check console for detailed error
- Fallback should still work

### Issue: Loading spinner never stops
**Solution**:
- Check if API response timed out
- Verify `GEMINI_CONFIG.TIMEOUT` is reasonable (30s)
- Component should show error after timeout

### Issue: Suggestions are irrelevant
**Solution**:
- Check if `SYSTEM_PROMPTS` are loaded correctly
- Verify context is being passed to AI service
- Try different prompts

---

## 📊 Test Data Suggestions

### Customer Test Queries:
```
✅ Good queries that trigger AI:
- "I need urgent plumber for bathroom leak"
- "looking for electrician to install ceiling fan"
- "want someone to repair my fridge"
- "help me find AC technician for emergency"

❌ Queries that DON'T trigger AI:
- "plumber"
- "electrician near me"
- "AC repair"
- (single words or standard searches)
```

### Deal Request Test Inputs:
```
✅ Good test inputs:
- "My AC stopped cooling"
- "Kitchen sink is leaking badly"
- "Need ceiling fan installed"
- "Bathroom tap broken, water everywhere"

✅ Expected AI to extract:
- Category: AC Technician / Plumber / Electrician
- Urgency: High / Medium / Low
- Questions: 2-3 clarifying questions
```

---

## 🎬 Demo Flow (For User Walkthrough)

### Customer Journey:
1. **Open app** → Show home screen
2. **Find worker** → Browse or search
3. **Tap "Send Request"** → Open modal
4. **Show AI Helper** → "✨ Help me describe my problem"
5. **Enter problem** → "My AC is not cooling"
6. **AI asks questions** → Answer them
7. **AI generates description** → Show + allow edit
8. **Submit request** → Sent successfully

### Worker Journey:
1. **Open app** → Switch to Worker mode
2. **Go to Activity** → New Requests tab
3. **See NEW request** → Customer needs help
4. **Show AI Suggestions** → 3 reply options
5. **Select "Accept"** → Request accepted
6. **Go to Messages** → Open chat
7. **Customer asks question** → See message
8. **Tap AI Suggestions** → 3 reply chips appear
9. **Select reply** → Insert and send

---

## ✅ Acceptance Criteria

### Must Pass:
- [ ] AI Request Helper modal opens and closes
- [ ] AI generates description from user input
- [ ] Search Assist detects natural language
- [ ] Search Assist auto-applies category filter
- [ ] Reply Suggestions show 3 options (Accept/Waitlist/Reject)
- [ ] Chat Suggestions show 3 reply variations
- [ ] All AI features show loading states
- [ ] All AI features have "AI suggestion" notices
- [ ] No auto-send (user must confirm all actions)
- [ ] Error handling works (shows retry/fallback)
- [ ] Works in both Customer and Worker modes (respective features)

### Nice to Have:
- [ ] Smooth animations on modal open/close
- [ ] Keyboard avoidance works properly
- [ ] Haptic feedback on button taps
- [ ] Suggestions update when message changes

---

## 📝 Testing Notes

### Performance:
- AI responses should appear within 2-5 seconds
- If >5 seconds, show timeout error
- Debounce prevents API spam (300ms for search)

### API Usage:
- Each AI feature makes 1 API call
- Failed calls retry once automatically
- TODO: Rate limiting needed in production

### Accessibility:
- All buttons have clear labels
- Icons have proper sizes (18-24px)
- Text contrast meets WCAG standards
- Touch targets are 44x44 minimum

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Mark STAGE 10 as complete
2. Document any bugs found
3. Prepare for STAGE 11 (if planned)
4. Consider backend proxy implementation (TODO)
5. Add analytics tracking for AI feature usage

If tests fail:
1. Note which feature failed
2. Check console logs
3. Verify API key is valid
4. Test with different inputs
5. Report issues with reproduction steps
