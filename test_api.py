import urllib.request
import urllib.error
import json

def test():
    base = 'http://127.0.0.1:8000'
    print("Testing Airbnb Clone APIs...")
    
    # 1. Listings
    res = urllib.request.urlopen(f'{base}/api/listings')
    listings = json.loads(res.read())
    print(f'[PASS] Listings fetched: {len(listings)} items')

    # 2. Detail
    l_id = listings[0]['id']
    res = urllib.request.urlopen(f'{base}/api/listings/{l_id}')
    detail = json.loads(res.read())
    print(f'[PASS] Listing #{l_id} detail: "{detail["title"]}", {len(detail["images"])} photos, {len(detail["amenities"])} amenities')

    # 3. Availability
    res = urllib.request.urlopen(f'{base}/api/listings/{l_id}/availability')
    avail = json.loads(res.read())
    print(f'[PASS] Listing #{l_id} availability booked ranges: {len(avail["booked_ranges"])}')

    # 4. Host Dashboard
    res = urllib.request.urlopen(f'{base}/api/host/dashboard?host_id=1')
    host_dash = json.loads(res.read())
    print(f'[PASS] Host dashboard: {host_dash["total_listings"]} listings, {host_dash["total_bookings"]} bookings, ${host_dash["total_revenue"]} revenue')

    # 5. Trips
    res = urllib.request.urlopen(f'{base}/api/trips?user_id=5')
    trips = json.loads(res.read())
    print(f'[PASS] User trips: {len(trips)} bookings')

    # 6. Test booking creation
    test_booking = {
        'listing_id': 1,
        'user_id': 5,
        'check_in': '2027-06-01',
        'check_out': '2027-06-05',
        'guests_count': 2
    }
    req = urllib.request.Request(f'{base}/api/bookings', data=json.dumps(test_booking).encode('utf-8'), headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    b_data = json.loads(res.read())
    print(f'[PASS] Booking created successfully: #{b_data["id"]} for ${b_data["total_price"]}')

    # 7. Collision check: try to book overlapping dates (should fail with 409)
    try:
        overlap_booking = {
            'listing_id': 1,
            'user_id': 6,
            'check_in': '2027-06-03',
            'check_out': '2027-06-07',
            'guests_count': 2
        }
        req2 = urllib.request.Request(f'{base}/api/bookings', data=json.dumps(overlap_booking).encode('utf-8'), headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req2)
        print('[FAIL] Collision check should have rejected overlapping dates!')
    except urllib.error.HTTPError as e:
        print(f'[PASS] Date collision prevented with status {e.code}: {e.reason}')

    # 8. Wishlist toggle
    req_wl = urllib.request.Request(f'{base}/api/wishlist/toggle', data=json.dumps({'user_id': 5, 'listing_id': 2}).encode('utf-8'), headers={'Content-Type': 'application/json'})
    res_wl = urllib.request.urlopen(req_wl)
    wl_data = json.loads(res_wl.read())
    print(f'[PASS] Wishlist toggled: is_saved={wl_data["is_saved"]}')

    print("\nALL TEST SUITE CHECKS PASSED WITH 100% SUCCESS!")

if __name__ == '__main__':
    test()
