#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>
#include <atomic>
#include <chrono>
using namespace std;

queue<int> buffer;
mutex mtx;
condition_variable cv;
const int MAX_ITEMS = 10;
atomic<int> producedCount(0);
atomic<bool> finished(false);

void producer()
{
    for (int i = 1; i <= MAX_ITEMS; i++)
    {
        this_thread::sleep_for(chrono::milliseconds(100));
        {
            lock_guard<mutex> lock(mtx);
            buffer.push(i);
            producedCount++;
            cout << "Produced: " << i << endl;
        }
        cv.notify_one();
    }
    finished = true;
    cv.notify_all();
}

void consumer()
{
    while (true)
    {
        unique_lock<mutex> lock(mtx);
        cv.wait(lock, [] {
            return !buffer.empty() || finished;
        });

        if (buffer.empty() && finished)
            break;

        int item = buffer.front();
        buffer.pop();
        lock.unlock();

        cout << "Consumed: " << item << endl;
    }
}

int main()
{
    cout << "Producer-Consumer System Started\n" << endl;

    thread producerThread(producer);
    thread consumerThread(consumer);

    producerThread.join();
    consumerThread.join();

    cout << "\nTotal Items Produced: " << producedCount << endl;
    cout << "Producer-Consumer System Completed" << endl;

    return 0;
}