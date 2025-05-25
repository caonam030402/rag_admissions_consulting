#!/usr/bin/env python3
"""
Test Runner for RAG Admissions Consulting
Chạy các test theo thứ tự khuyến nghị
"""

import subprocess
import sys
import time
import os


def run_test(test_file, description):
    """Chạy một test file"""
    print(f"\n{'='*60}")
    print(f"🧪 {description}")
    print(f"📁 File: {test_file}")
    print(f"{'='*60}")

    try:
        # Chạy test
        result = subprocess.run(
            [sys.executable, test_file], capture_output=True, text=True, cwd=".."
        )

        if result.returncode == 0:
            print("✅ TEST PASSED")
            print(result.stdout)
        else:
            print("❌ TEST FAILED")
            print("STDOUT:", result.stdout)
            print("STDERR:", result.stderr)

    except Exception as e:
        print(f"❌ ERROR running test: {e}")

    print(f"\n{'='*60}")
    return result.returncode == 0


def main():
    """Chạy tất cả tests theo thứ tự khuyến nghị"""
    print("🎯 RAG Admissions Consulting - Test Suite")
    print("Chạy các test theo thứ tự khuyến nghị...\n")

    # Danh sách tests theo thứ tự ưu tiên
    tests = [
        ("tests/test_direct_chat.py", "Test ChatService trực tiếp (cơ bản nhất)"),
        ("tests/test_cache.py", "Test ContextCache riêng biệt"),
        ("tests/test_streaming_api.py", "Test API streaming (cần server chạy)"),
        ("tests/test_final_context.py", "Test context memory hoàn chỉnh"),
    ]

    passed = 0
    total = len(tests)

    for test_file, description in tests:
        if run_test(test_file, description):
            passed += 1

        # Đợi một chút giữa các test
        time.sleep(2)

    # Tổng kết
    print(f"\n🎉 TEST SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")

    if passed == total:
        print("🎊 ALL TESTS PASSED! Chatbot hoạt động hoàn hảo!")
    else:
        print("⚠️ Some tests failed. Kiểm tra logs để debug.")

    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
