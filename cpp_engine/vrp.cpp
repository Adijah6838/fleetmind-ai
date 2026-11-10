#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <iomanip>

using namespace std;

const double PI = 3.14159265358979323846;

struct Delivery {
    int id;
    double lat, lng;
    double weight;
    int priority; // 3=Urgent, 2=High, 1=Normal, 0=Low
};

struct Vehicle {
    int id;
    double capacity;
    double current_load;
    double lat, lng;
    vector<int> assigned_deliveries;
};

double haversine(double lat1, double lng1, double lat2, double lng2) {
    double dlat = (lat2 - lat1) * PI / 180.0;
    double dlng = (lng2 - lng1) * PI / 180.0;
    double a = sin(dlat/2)*sin(dlat/2) + cos(lat1*PI/180.0)*cos(lat2*PI/180.0)*sin(dlng/2)*sin(dlng/2);
    return 6371.0 * 2 * atan2(sqrt(a), sqrt(1-a));
}

int main() {
    int num_vehicles, num_deliveries;
    if (!(cin >> num_vehicles >> num_deliveries)) return 0;

    vector<Vehicle> vehicles(num_vehicles);
    for (int i = 0; i < num_vehicles; ++i) {
        cin >> vehicles[i].capacity >> vehicles[i].lat >> vehicles[i].lng;
        vehicles[i].id = i + 1;
        vehicles[i].current_load = 0;
    }

    vector<Delivery> deliveries(num_deliveries);
    for (int i = 0; i < num_deliveries; ++i) {
        cin >> deliveries[i].weight >> deliveries[i].priority >> deliveries[i].lat >> deliveries[i].lng;
        deliveries[i].id = i + 1;
    }

    // Sort deliveries by priority (descending), then weight (descending)
    sort(deliveries.begin(), deliveries.end(), [](const Delivery& a, const Delivery& b) {
        if (a.priority != b.priority) return a.priority > b.priority;
        return a.weight > b.weight;
    });

    // Greedy Assignment: Assign each delivery to the nearest vehicle with enough capacity
    vector<Delivery> unassigned;
    for (auto& d : deliveries) {
        int best_v = -1;
        double min_dist = 1e9;
        for (int i = 0; i < num_vehicles; ++i) {
            if (vehicles[i].current_load + d.weight <= vehicles[i].capacity) {
                double dist = haversine(vehicles[i].lat, vehicles[i].lng, d.lat, d.lng);
                if (dist < min_dist) {
                    min_dist = dist;
                    best_v = i;
                }
            }
        }
        if (best_v != -1) {
            vehicles[best_v].current_load += d.weight;
            vehicles[best_v].assigned_deliveries.push_back(d.id);
        } else {
            unassigned.push_back(d);
        }
    }

    // Nearest Neighbor TSP for each vehicle
    for (auto& v : vehicles) {
        if (v.assigned_deliveries.empty()) continue;
        
        vector<int> route;
        double curr_lat = v.lat, curr_lng = v.lng;
        double total_dist = 0;
        
        vector<int> pending = v.assigned_deliveries;
        while (!pending.empty()) {
            int best_idx = -1;
            double min_d = 1e9;
            for (size_t i = 0; i < pending.size(); ++i) {
                // Find delivery coords
                double d_lat = 0, d_lng = 0;
                for (auto& dl : deliveries) if (dl.id == pending[i]) { d_lat = dl.lat; d_lng = dl.lng; break; }
                
                double dist = haversine(curr_lat, curr_lng, d_lat, d_lng);
                if (dist < min_d) { min_d = dist; best_idx = i; }
            }
            int next_id = pending[best_idx];
            route.push_back(next_id);
            total_dist += min_d;
            
            for (auto& dl : deliveries) if (dl.id == next_id) { curr_lat = dl.lat; curr_lng = dl.lng; break; }
            pending.erase(pending.begin() + best_idx);
        }
        
        cout << v.id << " " << fixed << setprecision(2) << total_dist << " " << route.size();
        for (int id : route) cout << " " << id;
        cout << "\n";
    }

    if (!unassigned.empty()) {
        cout << "UNASSIGNED " << unassigned.size() << "\n";
    } else {
        cout << "UNASSIGNED 0\n";
    }
    return 0;
}
