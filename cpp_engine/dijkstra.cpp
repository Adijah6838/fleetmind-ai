#include <iostream>
#include <vector>
#include <queue>
#include <limits>
#include <cmath>
#include <chrono>

using namespace std;

const double INF = numeric_limits<double>::infinity();

struct Edge {
    int to;
    double weight;
};

struct Node {
    double lat, lng;
};

double haversine(double lat1, double lng1, double lat2, double lng2) {
    // Approximate great-circle distance in km
    const double R = 6371.0;
    const double PI = 3.14159265358979323846;
    double dlat = (lat2 - lat1) * PI / 180.0;
    double dlng = (lng2 - lng1) * PI / 180.0;
    double a = sin(dlat/2)*sin(dlat/2) +
               cos(lat1*PI/180.0)*cos(lat2*PI/180.0)*sin(dlng/2)*sin(dlng/2);
    return R * 2 * atan2(sqrt(a), sqrt(1-a));
}

int main(int argc, char* argv[]) {
    string algo = "dijkstra";
    if (argc > 1) algo = argv[1];

    int num_nodes, num_edges;
    if (!(cin >> num_nodes >> num_edges)) return 0;

    vector<Node> nodes(num_nodes + 1);
    for (int i = 1; i <= num_nodes; ++i) {
        cin >> nodes[i].lat >> nodes[i].lng;
    }

    vector<vector<Edge>> graph(num_nodes + 1);
    for (int i = 0; i < num_edges; ++i) {
        int u, v;
        double w;
        cin >> u >> v >> w;
        graph[u].push_back({v, w});
        graph[v].push_back({u, w});
    }

    int start_node, end_node;
    cin >> start_node >> end_node;

    auto t0 = chrono::high_resolution_clock::now();

    vector<double> dist(num_nodes + 1, INF);
    vector<int> parent(num_nodes + 1, -1);

    if (algo == "dijkstra") {
        priority_queue<pair<double, int>, vector<pair<double, int>>, greater<>> pq;
        dist[start_node] = 0;
        pq.push({0, start_node});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue;
            for (auto& e : graph[u]) {
                if (dist[u] + e.weight < dist[e.to]) {
                    dist[e.to] = dist[u] + e.weight;
                    parent[e.to] = u;
                    pq.push({dist[e.to], e.to});
                }
            }
        }
    } else if (algo == "astar") {
        // A*: priority = g(n) + h(n), h = haversine to target
        auto heuristic = [&](int n) {
            return haversine(nodes[n].lat, nodes[n].lng, nodes[end_node].lat, nodes[end_node].lng);
        };
        // Priority queue stores (f_score, node)
        priority_queue<pair<double, int>, vector<pair<double, int>>, greater<>> pq;
        dist[start_node] = 0;
        pq.push({heuristic(start_node), start_node});
        while (!pq.empty()) {
            auto [f, u] = pq.top(); pq.pop();
            double g = dist[u];
            // If f == g + h and we popped end, we're done
            if (u == end_node) break;
            for (auto& e : graph[u]) {
                double new_g = g + e.weight;
                if (new_g < dist[e.to]) {
                    dist[e.to] = new_g;
                    parent[e.to] = u;
                    pq.push({new_g + heuristic(e.to), e.to});
                }
            }
        }
    }

    auto t1 = chrono::high_resolution_clock::now();
    double elapsed_us = chrono::duration<double, micro>(t1 - t0).count();

    if (dist[end_node] == INF) {
        cout << "NO_PATH" << endl;
    } else {
        cout << dist[end_node] << endl;
        vector<int> path;
        for (int at = end_node; at != -1; at = parent[at]) path.push_back(at);
        for (int i = path.size() - 1; i >= 0; --i) {
            cout << path[i] << (i == 0 ? "" : " ");
        }
        cout << endl;
    }
    cout << elapsed_us << endl; // execution time in microseconds
    return 0;
}
