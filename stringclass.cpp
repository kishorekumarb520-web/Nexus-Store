#include <iostream>
#include <cstring>
#include <chrono>
#include <utility>
using namespace std;
using namespace chrono;

class String
{
private:
    char* data;
    size_t length;

public:
    
    String(const char* str = "")
    {
        length = strlen(str);
        data = new char[length + 1];
        strcpy(data, str);
    }

    
    String(const String& other)
    {
        length = other.length;
        data = new char[length + 1];
        strcpy(data, other.data);
    }

    // Move Constructor
    String(String&& other) noexcept
    {
        data = other.data;
        length = other.length;
        other.data = nullptr;
        other.length = 0;
    }

    
    String& operator=(const String& other)
    {
        if (this != &other)
        {
            delete[] data;
            length = other.length;
            data = new char[length + 1];
            strcpy(data, other.data);
        }
        return *this;
    }

    
    String& operator=(String&& other) noexcept
    {
        if (this != &other)
        {
            delete[] data;
            data = other.data;
            length = other.length;
            other.data = nullptr;
            other.length = 0;
        }
        return *this;
    }

    
    ~String()
    {
        delete[] data;
    }

    void display() const
    {
        if (data != nullptr)
            cout << data << endl;
    }
};


template <typename T>
String createString(T&& value)
{
    return String(forward<T>(value));
}

int main()
{
    const int SIZE = 100000;
    String original("This is a resource-heavy string used to demonstrate copy and move semantics in C++.");

    
    auto startCopy = high_resolution_clock::now();
    for (int i = 0; i < SIZE; i++)
    {
        String copy = original;
    }
    auto endCopy = high_resolution_clock::now();
    auto copyTime = duration_cast<milliseconds>(endCopy - startCopy);

    
    auto startMove = high_resolution_clock::now();
    for (int i = 0; i < SIZE; i++)
    {
        String temp("This is a resource-heavy string used for move semantics.");
        String moved = move(temp);
    }
    auto endMove = high_resolution_clock::now();
    auto moveTime = duration_cast<milliseconds>(endMove - startMove);

    
    String forwarded = createString("Perfect Forwarding Example");
    cout << "Perfect Forwarding Result: ";
    forwarded.display();

    
    cout << "\nCopy Operation Time: " << copyTime.count() << " milliseconds" << endl;
    cout << "Move Operation Time: " << moveTime.count() << " milliseconds" << endl;

    return 0;
}