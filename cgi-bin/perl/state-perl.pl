#!/usr/bin/perl
use strict;
use warnings;
use CGI;
use JSON;
use File::Spec;
use POSIX qw(strftime);


my $SESSION_DIR = "/tmp/cse135_sessions";
mkdir $SESSION_DIR unless -d $SESSION_DIR;

my $q = CGI->new;
my $json_converter = JSON->new->utf8;

# first, i need to get the session id (coming from the web)
my $sid = $q->cookie('cse135_session');

# create load session from server
sub load_session {
    my ($sid) = @_;
    my $path = "$SESSION_DIR/$sid.json";

    if (-e $path) {
        open(my $fh, '<', $path) or return {};
        my $content = <$fh>;
        close($fh);
        return $json_converter->decode($content) if $content;
    }

    return {};
}

# update session to server
sub update_session {
    my ($sid, $data) = @_;
    my $path = "$SESSION_DIR/$sid.json";

    open(my $fh, '>', $path) or die "Could not open file '$path' $!";
    print $fh $json_converter->encode($data);
    close($fh);
}

# if no session id, create one (watch out for what happens to the data)
if (!$sid || !-e File::Spec->catfile($SESSION_DIR, "$sid.json")) {
    # generate a simple random id (hex)
    $sid = sprintf("%08x%08x", rand(0xffffffff), rand(0xffffffff));
    update_session($sid, {});
}

# now it's time to figure out what the user wants

my $method = $q->request_method(); # how the information got there
my $action = $q->param('action') || 'view'; # what the user wants to do

my $session = load_session($sid); # information stored on server

# if the user is sending data to be saved or cleared
if ($method eq 'POST') {
    if ($action eq 'save') {
        $session->{name} = $q->param('name') || '';
        $session->{favorite_color} = $q->param('favorite_color') || '';
        $session->{favorite_food} = $q->param('favorite_food') || '';
        $session->{message} = $q->param('message') || '';
        $session->{saved_at} = strftime("%A, %B %d, %Y %I:%M:%S %p", localtime);
        update_session($sid, $session);
    } elsif ($action eq 'clear') {
        $session = {}; # define as empty
        update_session($sid, $session);
    }
}

my $cookie = $q->cookie( # circulate the session id back to the user
    -name    => 'cse135_session', # key
    -value   => $sid, # value
    -expires => '+1h', # others are rules for the browser while it's guarding the cookie
    -path    => '/',
    -httponly => 1
);

print $q->header(-cookie => $cookie); # headers with cookie info

# for safety against executable code injection
sub esc {
    my ($text) = @_;
    $text = "" unless defined $text;
    $text =~ s/&/&amp;/g;
    $text =~ s/</&lt;/g;
    $text =~ s/>/&gt;/g;
    return $text;
}


# determine which page customized to show
my $page = $action;
if ($action eq 'save' && $method eq 'POST') { $page = 'saved'; }
if ($action eq 'clear' && $method eq 'POST') { $page = 'cleared'; }

# --- HTML OUTPUT ---
print <<EOF;
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>State Demo - Perl</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        .nav-links { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .nav-links a { background: white; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; color: #1e40af; font-weight: 600; transition: all 0.2s; }
        .nav-links a:hover, .nav-links a.active { background: #1e40af; color: white; border-color: #1e40af; }
        .card { background: white; border-radius: 0.75rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
        label { display: block; font-weight: 600; color: #374151; margin: 1rem 0 0.3rem; }
        input, textarea { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.95rem; box-sizing: border-box; font-family: inherit; }
        .btn-row { display: flex; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap; }
        .btn-danger { background: #dc2626; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 600; }
        .success-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 0.5rem; padding: 1rem; color: #166534; margin-bottom: 1rem; }
        .empty-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; color: #6b7280; text-align: center; font-style: italic; }
        .data-row { display: flex; padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; }
        .data-label { font-weight: 600; color: #1e40af; width: 160px; flex-shrink: 0; }
        .data-value { color: #374151; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>State Demo</h1>
            <p>Perl CGI - Server-Side Sessions</p>
        </div>
    </header>
    <main class="container">
        <div class="nav-links">
            <a href="state-perl.pl?action=save" class="@{[ $page eq 'save' ? 'active' : '' ]}">Save Data</a>
            <a href="state-perl.pl?action=view" class="@{[ $page eq 'view' ? 'active' : '' ]}">View Data</a>
        </div>
EOF

if ($page eq 'save' || $page eq 'saved') {
    if ($page eq 'saved') {
        print '<div class="success-box">Data saved successfully! <a href="state-perl.pl?action=view">View your saved data</a></div>';
    }
    print <<EOF;
    <div class="card">
        <h2>Save Your Data</h2>
        <form method="POST" action="state-perl.pl">
            <input type="hidden" name="action" value="save">
            <label>Your Name</label><input type="text" name="name">
            <label>Favorite Color</label><input type="text" name="favorite_color">
            <label>Favorite Food</label><input type="text" name="favorite_food">
            <label>A Message</label><textarea name="message"></textarea>
            <div class="btn-row"><button type="submit" class="button">Save</button></div>
        </form>
    </div>
EOF
} elsif ($page eq 'cleared') {
    print '<div class="success-box">Data cleared successfully! <a href="state-perl.pl?action=save">Save new data</a></div>';
} elsif ($page eq 'view') {
    if ($session->{name}) { # dummy check for existing data before showing
        print <<EOF;
        <div class="card">
            <h2>Your Saved Data</h2>
            <div class="data-row"><div class="data-label">Name</div><div class="data-value">@{[ esc($session->{name}) ]}</div></div>
            <div class="data-row"><div class="data-label">Favorite Color</div><div class="data-value">@{[ esc($session->{favorite_color}) ]}</div></div>
            <div class="data-row"><div class="data-label">Favorite Food</div><div class="data-value">@{[ esc($session->{favorite_food}) ]}</div></div>
            <div class="data-row"><div class="data-label">Message</div><div class="data-value">@{[ esc($session->{message}) ]}</div></div>
            <div class="data-row"><div class="data-label">Saved At</div><div class="data-value">@{[ esc($session->{saved_at}) ]}</div></div>
            <div class="btn-row">
                <form method="POST" action="state-perl.pl" style="margin:0;">
                    <input type="hidden" name="action" value="clear">
                    <button type="submit" class="btn-danger">Clear Data</button>
                </form>
                <a href="state-perl.pl?action=save" class="button">Edit</a>
            </div>
        </div>
EOF
    } else { # no data interface
        print '<div class="empty-box">No data saved yet. <a href="state-perl.pl?action=save">Go save some data!</a></div>';
    }
}

print <<EOF;
        <div style="text-align:center; margin-top: 2rem;">
            <a href="../../index.html" class="button">Back to Home</a>
        </div>
    </main>
    <footer><p>&copy; 2026 CSE 135 Team</p></footer>
</body>
</html>
EOF

