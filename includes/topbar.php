<?php
/**
 * topbar.php
 * ---------------------------------------------------------------------
 * The notification-bell + user-identity chip that sits in the top
 * right of every page's header banner. This showed up in the
 * Announcements reference image (bell with a badge count, avatar
 * initial, name + role, dropdown chevron) but logically belongs on
 * EVERY logged-in page, not just this one -- so it's its own include
 * rather than something copy-pasted into announcements.php. We also
 * added it to dashboard.php's hero for consistency (see that file).
 *
 * WHERE IT GETS PLACED:
 * This only outputs the .ps-topbar markup itself -- positioning is
 * left to whatever hero/banner container the calling page wraps it
 * in, since every page's hero looks a little different (dashboard's
 * is a small rounded photo, announcements' is a full-width banner).
 * Each page's CSS just needs `position: relative` on that wrapper and
 * `.ps-topbar { position: absolute; top: ...; right: ...; }` -- that
 * part already lives in style.css since the topbar itself is shared.
 *
 * HARDCODED FOR NOW (no backend this session):
 *   $userFirstName / $userRole / $notifCount can be set by the
 *   calling page before requiring this file; sensible defaults below
 *   otherwise. NOTE: the reference mockups literally show "qweqwe" as
 *   the test username -- we intentionally used the same demo identity
 *   as the dashboard (Juan Dela Cruz / Parishioner) instead, so the
 *   "logged in user" looks consistent across pages instead of jumping
 *   between two different placeholder names. Once login.php exists,
 *   all of this comes from $_SESSION instead.
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/icons.php';

if (!isset($userFirstName)) { $userFirstName = 'Juan'; }
if (!isset($userRole))      { $userRole = 'Parishioner'; }

// A page can set $notifications before requiring this file, same
// convention as $userFirstName/$userRole. Default set below differs
// for admin vs. parishioner context so the demo content matches who's
// looking at it -- the wedding-seminar item is the one this feature
// is actually about (see admin-requests.php's document checklist:
// once every wedding document is checked AND staff approves, the
// couple would be notified here to pick a seminar date). Design
// preview only -- nothing is pushed from a real event yet.
if (!isset($notifications)) {
    if ($userRole === 'Admin') {
        $notifications = [
            ['icon' => 'document', 'title' => 'New request submitted', 'body' => 'Baby Gabriel Reyes baptism request just came in.', 'time' => '2h ago'],
            ['icon' => 'heart',    'title' => 'Donation awaiting review', 'body' => 'Maria Santos submitted proof of payment.', 'time' => '5h ago'],
        ];
    } else {
        $notifications = [
            [
                'icon' => 'ring', 'title' => 'Wedding request approved!',
                'body' => 'All your documents are complete. Please choose your Pre-Cana Seminar date below.',
                'time' => 'Just now',
                'seminarPicker' => true,
            ],
            ['icon' => 'droplet', 'title' => 'Baptism request under review', 'body' => "We're reviewing Baby Sofia's documents.", 'time' => '2 days ago'],
        ];
    }
}
$notifCount = count($notifications);

$userInitial = strtoupper(substr($userFirstName, 0, 1));
?>
<div class="ps-topbar">
    <div class="ps-notif-wrap">
        <button type="button" class="ps-notif-btn" aria-label="Notifications" aria-expanded="false" data-notif-toggle>
            <?php ps_icon('bell'); ?>
            <?php if ($notifCount > 0): ?>
                <span class="ps-notif-badge"><?php echo (int) $notifCount; ?></span>
            <?php endif; ?>
        </button>

        <div class="ps-notif-panel" data-notif-panel hidden>
            <div class="ps-notif-panel-header">Notifications</div>
            <?php if (empty($notifications)): ?>
                <p class="ps-notif-empty">You're all caught up.</p>
            <?php endif; ?>
            <?php foreach ($notifications as $n): ?>
                <div class="ps-notif-item">
                    <span class="ps-notif-item-icon"><?php ps_icon($n['icon']); ?></span>
                    <div class="ps-notif-item-body">
                        <strong><?php echo htmlspecialchars($n['title']); ?></strong>
                        <p><?php echo htmlspecialchars($n['body']); ?></p>
                        <?php if (!empty($n['seminarPicker'])): ?>
                            <div class="ps-notif-seminar" data-seminar-notif>
                                <span class="ps-select">
                                    <select>
                                        <option value="">Choose a seminar date</option>
                                        <option value="1st">1st Saturday of the month</option>
                                        <option value="3rd">3rd Saturday of the month</option>
                                    </select>
                                </span>
                                <button type="button" class="ps-btn ps-btn-primary" data-seminar-confirm>Confirm</button>
                            </div>
                        <?php endif; ?>
                        <small class="ps-notif-item-time"><?php echo htmlspecialchars($n['time']); ?></small>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <div class="ps-user-chip">
        <span class="ps-user-avatar"><?php echo htmlspecialchars($userInitial); ?></span>
        <span class="ps-user-info">
            <strong><?php echo htmlspecialchars($userFirstName); ?></strong>
            <small><?php echo htmlspecialchars($userRole); ?></small>
        </span>
        <?php ps_icon('chevron-down', 'ps-user-chevron'); ?>
    </div>
</div>
