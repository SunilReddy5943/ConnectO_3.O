# STAGE 12: Testing & Verification Guide

## Quick Test Checklist

### 1. First Launch Experience ✅
**Test:** Fresh Install Flow
```
1. Clear app data or install fresh
2. Launch the app
3. ✅ Terms acceptance modal should appear
4. ✅ Try clicking "Get Started" - should be disabled
5. ✅ Click Terms of Service link - should navigate
6. ✅ Click Privacy Policy link - should navigate
7. ✅ Check the checkbox
8. ✅ Click "Get Started" - should close modal and save preference
9. Restart app
10. ✅ Modal should NOT appear again
```

### 2. Empty States ✅
**Test:** All Empty States Display Correctly

**Activity Screen:**
```
1. Go to Activity tab
2. ✅ If no activity: "No Activity Yet" with helpful message
3. ✅ Switch to "New Requests" tab
4. ✅ Should show "Find Workers" CTA button
```

**Notifications:**
```
1. Go to Profile > Notifications
2. ✅ If empty: "All Caught Up!" message
3. ✅ Friendly icon and message displayed
```

**Saved Workers:**
```
1. Go to Profile > Saved Workers
2. ✅ If empty: "No Saved Workers" message
3. ✅ "Browse Workers" CTA button displayed
```

### 3. Loading States ✅
**Test:** Skeleton Loaders

**Search:**
```
1. Go to Search tab
2. Enter search query
3. ✅ Skeleton loaders should appear while loading
4. ✅ No blank screen during loading
```

**Activity:**
```
1. Pull to refresh on Activity screen
2. ✅ Refresh indicator shows
3. ✅ Content updates smoothly
```

### 4. Terms & Privacy ✅
**Test:** Legal Screens Accessible

```
1. Go to Profile (logged in or guest)
2. Scroll to bottom
3. ✅ App version displayed (v1.0.0)
4. ✅ Can navigate to About/Feature Flags
5. From welcome modal or index:
6. ✅ Click Terms of Service - full terms displayed
7. ✅ Click Privacy Policy - full policy displayed
8. ✅ Back button works correctly
```

### 5. Report User Safety ✅
**Test:** Report Functionality

```
1. Go to any worker profile
2. Click "Contact" or profile options
3. ✅ "Report this user" option visible
4. Click "Report this user"
5. ✅ Report modal opens with reasons
6. Select a reason (e.g., "Spam or Scam")
7. ✅ Confirmation alert appears
8. ✅ Modal closes
9. Check AsyncStorage (@connecto_user_reports)
10. ✅ Report stored with userId, reason, timestamp
```

### 6. Referral Visibility ✅
**Test:** Referral Program Highlighting

**Profile Screen:**
```
1. Login as any user
2. Go to Profile tab
3. ✅ Large referral card visible above logout
4. ✅ "Refer & earn ₹100" heading
5. ✅ Purple background with gift icon
6. ✅ "Refer now" button works
7. Scroll to menu items
8. ✅ "Refer & Earn" menu item has 💰 emoji
9. ✅ Subtitle mentions ₹100 reward
```

**Smart Prompts:**
```
Worker Mode:
1. Switch to Worker role
2. Accept a deal request
3. Mark work as "Completed"
4. ✅ After ~2 seconds, referral prompt should appear
5. ✅ Message about earning ₹100 for referrals

Customer Mode:
1. Switch to Customer role
2. Find a completed work
3. Submit a review
4. ✅ Referral prompt appears after review
5. ✅ Thanks message + referral invitation
```

### 7. Role Confidence ✅
**Test:** Role Persistence & Helper Text

```
1. Login with account that has both roles
2. Go to Profile
3. ✅ Role switcher section visible
4. ✅ Helper text: "You have 2 roles. The app will remember your last choice."
5. Switch to Worker role
6. Close app completely
7. Reopen app
8. ✅ App opens in Worker role (remembered choice)
9. Switch back to Customer
10. Close and reopen
11. ✅ App opens in Customer role
```

### 8. Analytics Events ✅
**Test:** Events Logged Correctly

**Search Events:**
```
1. Go to Search tab
2. Enter search query
3. Apply filters
4. Check console (development mode)
5. ✅ Should see: [ANALYTICS] search_performed {query, filters}
```

**Deal Events:**
```
1. Worker: Accept a deal request
2. ✅ Console: [ANALYTICS] deal_request_accepted
3. Mark as "Ongoing"
4. Mark as "Completed"
5. ✅ Console: [ANALYTICS] work_completed
```

**Review Events:**
```
1. Customer: Submit a review
2. ✅ Console: [ANALYTICS] review_submitted {dealId, rating}
```

**Check AsyncStorage:**
```
Key: @connecto_analytics_events
✅ Should contain array of events with:
   - event name
   - properties
   - timestamp
```

### 9. App Store Prep ✅
**Test:** Version & Feature Flags

```
1. Go to Profile
2. Scroll to bottom
3. ✅ "ConnectO v1.0.0 (development)" displayed
4. Click "About ConnectO"
5. ✅ App Information screen opens
6. ✅ Version: v1.0.0
7. ✅ Build: #1
8. ✅ Environment: development (or production)
9. ✅ Feature Flags section shows all flags
10. ✅ Each flag has ENABLED/DISABLED badge
11. ✅ Role features section visible
12. ✅ Help note at bottom
```

---

## Error Testing

### Network Errors
```
1. Turn off internet
2. Try to search
3. ✅ Error message displayed (if applicable)
4. ✅ No blank screen
5. ✅ Can retry when connection restored
```

### Empty Data
```
1. New account with no data
2. ✅ All screens show helpful empty states
3. ✅ Clear CTAs guide user what to do next
4. ✅ No confusing blank screens
```

---

## Regression Testing

### Critical Flows Still Working
```
✅ Login/Registration
✅ Search for workers
✅ Send deal requests
✅ Accept/Reject deals (Worker mode)
✅ Chat functionality
✅ Review submission
✅ Location services
✅ AI features
✅ Maps view (if enabled)
✅ Role switching
```

---

## Performance Checks

```
✅ App launches quickly
✅ Smooth scrolling on all lists
✅ Animations perform well
✅ No memory leaks
✅ AsyncStorage operations don't block UI
```

---

## Visual Polish

```
✅ Consistent spacing and padding
✅ All icons properly aligned
✅ Color scheme consistent
✅ Typography hierarchy clear
✅ Shadows and borders consistent
✅ No UI glitches or overlaps
```

---

## Accessibility

```
✅ Text is readable (minimum font sizes)
✅ Touch targets are adequate (44x44 minimum)
✅ Color contrast is sufficient
✅ Important actions are clearly labeled
✅ Error messages are clear
```

---

## Platform-Specific

### iOS
```
✅ Safe area insets respected
✅ Status bar style appropriate
✅ Navigation gestures work
✅ Keyboard behavior correct
```

### Android
```
✅ Back button handling
✅ Material Design guidelines followed
✅ Permission requests clear
✅ Notification handling
```

---

## Sign-Off Checklist

Before declaring LAUNCH READY:

- [ ] All Stage 12 features tested
- [ ] No critical bugs found
- [ ] Terms & Privacy reviewed by legal (if available)
- [ ] Analytics verified working
- [ ] Empty states all tested
- [ ] Loading states verified
- [ ] Error handling tested
- [ ] Report functionality works
- [ ] Referral flow tested
- [ ] Role persistence verified
- [ ] Version info correct
- [ ] Feature flags accurate
- [ ] No console errors in production build
- [ ] App icon and splash screen set
- [ ] App store screenshots prepared
- [ ] App description written

---

## Test Results Template

```
Date: __________
Tester: __________
Device: __________
OS Version: __________

Test Results:
- First Launch: ✅/❌
- Empty States: ✅/❌
- Loading States: ✅/❌
- Terms & Privacy: ✅/❌
- Report User: ✅/❌
- Referral Visibility: ✅/❌
- Role Confidence: ✅/❌
- Analytics: ✅/❌
- App Store Prep: ✅/❌

Critical Issues: __________
Minor Issues: __________
Notes: __________

Overall Status: PASS/FAIL
```

---

## Automated Testing Commands

```bash
# Run tests (if configured)
npm test

# Check for type errors
npx tsc --noEmit

# Lint code
npm run lint

# Build for production
npm run build

# Test on iOS simulator
npm run ios

# Test on Android emulator
npm run android
```

---

## Final Notes

**All Stage 12 requirements have been implemented and are ready for testing.**

Key Areas to Focus:
1. ✅ First-time user experience (Terms modal)
2. ✅ Empty states across all screens
3. ✅ Referral prompts timing and messaging
4. ✅ Role switching and persistence
5. ✅ Report user flow
6. ✅ Analytics event logging

**The app is LAUNCH READY once all tests pass!** 🚀
